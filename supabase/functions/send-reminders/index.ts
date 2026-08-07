// supabase/functions/send-reminders/index.ts
//
// Deploy with: supabase functions deploy send-reminders
//
// This function is called by pg_cron (see setup-cron-jobs.sql) at fixed UTC
// times. Each cron job passes a `reminderType` in the request body so one
// function can serve all four reminder categories without duplicating code.
//
// Because this runs server side, delivery no longer depends on the user's
// phone waking itself up, so Doze, WorkManager, and OEM battery managers
// (MIUI, ColorOS, etc) are irrelevant here. The only thing that has to
// happen on-device is accepting an incoming push, which the OS handles
// even while your app is fully closed.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type ReminderType = 'morning' | 'midday' | 'evening' | 'streak' | 'goals' | 'individual';

interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default';
}

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const EXPO_CHUNK_SIZE = 100; // Expo's documented batch limit per request

Deno.serve(async (req) => {
  try {
    const { reminderType } = (await req.json()) as { reminderType: ReminderType };

    if (!reminderType) {
      return new Response(JSON.stringify({ error: 'reminderType is required' }), {
        status: 400,
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, // service role, bypasses RLS
    );

    let messages: PushMessage[] = [];

    switch (reminderType) {
      case 'morning':
        messages = await buildMorningBriefing(supabase);
        break;
      case 'midday':
        messages = await buildMiddayNudge(supabase);
        break;
      case 'evening':
        messages = await buildEveningWrapUp(supabase);
        break;
      case 'streak':
        messages = await buildStreakSavers(supabase);
        break;
      case 'goals':
        messages = await buildGoalReminders(supabase);
        break;
      case 'individual':
        messages = await buildIndividualReminders(supabase);
        break;
    }

    const result = await sendExpoPushBatch(messages);

    return new Response(
      JSON.stringify({ reminderType, sent: messages.length, result }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('[send-reminders] error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});

// ── Reminder builders ─────────────────────────────────────────────────────
// Adjust table/column names below to match your actual schema. These
// assume: push_tokens(user_id, token, platform), notification_prefs(user_id,
// morning_briefing, evening_wrap_up, streak_savers, goal_updates),
// habits(user_id, completed_dates), goals(id, user_id, title, deadline,
// created_at).

async function buildMorningBriefing(supabase: ReturnType<typeof createClient>) {
  const { data: users, error } = await supabase
    .from('notification_prefs')
    .select('user_id, push_tokens(token)')
    .eq('morning_briefing', true);

  if (error) throw error;

  return (users ?? [])
    .filter((u: any) => u.push_tokens?.token)
    .map((u: any) => ({
      to: u.push_tokens.token,
      title: 'Good Morning! ☀️',
      body: "Check out your day's plan and focus.",
      data: { itemId: 'sys_morning_briefing', screen: 'tasks' },
      sound: 'default' as const,
    }));
}

async function buildMiddayNudge(supabase: ReturnType<typeof createClient>) {
  // Ideally, query if they have active tasks/habits and 0 done today,
  // but for simplicity we rely on the preference flag.
  const { data: users, error } = await supabase
    .from('notification_prefs')
    .select('user_id, push_tokens(token)')
    .eq('midday_nudge', true);

  if (error) throw error;

  return (users ?? [])
    .filter((u: any) => u.push_tokens?.token)
    .map((u: any) => ({
      to: u.push_tokens.token,
      title: 'Time to get moving! 🚀',
      body: "Your tasks, habits & goals are waiting. Make today count — let's go! 💪",
      data: { itemId: 'sys_midday_nudge', screen: 'tasks' },
      sound: 'default' as const,
    }));
}

async function buildEveningWrapUp(supabase: ReturnType<typeof createClient>) {
  const { data: users, error } = await supabase
    .from('notification_prefs')
    .select('user_id, push_tokens(token)')
    .eq('evening_wrap_up', true);

  if (error) throw error;

  return (users ?? [])
    .filter((u: any) => u.push_tokens?.token)
    .map((u: any) => ({
      to: u.push_tokens.token,
      title: 'Evening Wrap-up 🌙',
      body: 'Time to log your progress and plan tomorrow.',
      data: { itemId: 'sys_evening_wrapup', screen: 'tasks' },
      sound: 'default' as const,
    }));
}

async function buildStreakSavers(supabase: ReturnType<typeof createClient>) {
  const today = new Date().toISOString().split('T')[0];

  const { data: users, error } = await supabase
    .from('notification_prefs')
    .select('user_id, push_tokens(token), habits(completed_dates)')
    .eq('streak_savers', true);

  if (error) throw error;

  return (users ?? [])
    .filter((u: any) => {
      if (!u.push_tokens?.token) return false;
      const habits = u.habits ?? [];
      if (habits.length === 0) return false;
      const allDone = habits.every((h: any) => h.completed_dates?.includes(today));
      return !allDone; // only nudge users who still have habits left today
    })
    .map((u: any) => ({
      to: u.push_tokens.token,
      title: "Don't break your streak! 🔥",
      body: "You haven't completed your daily habits yet. Clock in now!",
      data: { itemId: 'sys_streak_saver', screen: 'habits' },
      sound: 'default' as const,
    }));
}

async function buildGoalReminders(supabase: ReturnType<typeof createClient>) {
  const now = Date.now();

  const { data: goals, error } = await supabase
    .from('goals')
    .select('id, title, deadline, created_at, user_id, push_tokens(token)')
    .gt('deadline', new Date().toISOString());

  if (error) throw error;

  const messages: PushMessage[] = [];

  for (const goal of goals ?? []) {
    const token = (goal as any).push_tokens?.token;
    if (!token) continue;

    const created = new Date((goal as any).created_at).getTime();
    const deadline = new Date((goal as any).deadline).getTime();

    const midpoint = created + (deadline - created) / 2;
    const threeDaysBefore = deadline - 3 * 24 * 60 * 60 * 1000;

    // Fire within a ~30 min window of the target, matching this cron's cadence
    const withinWindow = (target: number) => Math.abs(now - target) < 30 * 60 * 1000;

    if (withinWindow(midpoint)) {
      messages.push({
        to: token,
        title: 'Goal Mid-point Check-in 🎯',
        body: `You are halfway to your deadline for "${(goal as any).title}". Keep it up!`,
        data: { itemId: `goal_mid_${(goal as any).id}`, screen: 'goals' },
        sound: 'default',
      });
    }

    if (withinWindow(threeDaysBefore)) {
      messages.push({
        to: token,
        title: 'Deadline Approaching! ⏳',
        body: `Only 3 days left to achieve "${(goal as any).title}". You can do this!`,
        data: { itemId: `goal_warn_${(goal as any).id}`, screen: 'goals' },
        sound: 'default',
      });
    }
  }

  return messages;
}

function getNext24HourReminder(oldReminderString: string): string {
  const oldTime = new Date(oldReminderString).getTime();
  const nowTime = Date.now();
  const msInDay = 24 * 60 * 60 * 1000;
  
  let newTime = oldTime + msInDay;
  // If it's very overdue, keep adding 24 hours until it's in the future
  while (newTime <= nowTime) {
    newTime += msInDay;
  }
  return new Date(newTime).toISOString();
}

async function buildIndividualReminders(supabase: ReturnType<typeof createClient>) {
  const now = new Date().toISOString();
  const messages: PushMessage[] = [];
  const taskIds: string[] = [];
  const habitIds: string[] = [];

  // 1. Fetch pending tasks
  const { data: tasks, error: taskErr } = await supabase
    .from('tasks')
    .select('id, title, user_id, reminder_at')
    .lte('reminder_at', now)
    .eq('push_sent', false)
    .eq('completed', false); // Only remind if not completed!
  
  // 2. Fetch pending habits
  const { data: habits, error: habitErr } = await supabase
    .from('habits')
    .select('id, name, user_id, reminder_at')
    .lte('reminder_at', now)
    .eq('push_sent', false);

  const pendingTasks = (tasks ?? []) as any[];
  const pendingHabits = (habits ?? []) as any[];

  if (pendingTasks.length === 0 && pendingHabits.length === 0) {
    return messages;
  }

  // Collect all unique user IDs that need notifications
  const userIds = new Set<string>();
  pendingTasks.forEach(t => userIds.add(t.user_id));
  pendingHabits.forEach(h => userIds.add(h.user_id));

  // Get push tokens for those users
  const { data: pushTokens, error: tokenErr } = await supabase
    .from('push_tokens')
    .select('user_id, token')
    .in('user_id', Array.from(userIds));

  if (tokenErr || !pushTokens) return messages;

  // Build a lookup map: user_id -> string[] of tokens
  const tokenMap: Record<string, string[]> = {};
  pushTokens.forEach(pt => {
    if (!tokenMap[pt.user_id]) tokenMap[pt.user_id] = [];
    tokenMap[pt.user_id].push(pt.token);
  });

  // Check which users have push notifications disabled in their preferences
  const { data: prefs, error: prefsErr } = await supabase
    .from('notification_prefs')
    .select('user_id, push')
    .in('user_id', Array.from(userIds))
    .eq('push', false); // Only get the ones that disabled it

  const disabledUsers = new Set<string>();
  if (!prefsErr && prefs) {
    prefs.forEach(p => disabledUsers.add(p.user_id));
  }

  const updatePromises = [];

  // Build task messages
  for (const t of pendingTasks) {
    // Reschedule 24 hours later
    const nextTime = getNext24HourReminder(t.reminder_at);
    updatePromises.push(supabase.from('tasks').update({ reminder_at: nextTime }).eq('id', t.id));
    
    if (disabledUsers.has(t.user_id)) continue;

    const userTokens = tokenMap[t.user_id] || [];
    for (const token of userTokens) {
      messages.push({
        to: token,
        title: 'Task Reminder',
        body: t.title,
        data: { itemId: t.id, screen: 'tasks' },
        sound: 'default'
      });
    }
  }

  // Build habit messages
  for (const h of pendingHabits) {
    // Reschedule 24 hours later
    const nextTime = getNext24HourReminder(h.reminder_at);
    updatePromises.push(supabase.from('habits').update({ reminder_at: nextTime }).eq('id', h.id));

    if (disabledUsers.has(h.user_id)) continue;

    const userTokens = tokenMap[h.user_id] || [];
    for (const token of userTokens) {
      messages.push({
        to: token,
        title: 'Habit Reminder',
        body: `Time for: ${h.name}`,
        data: { itemId: h.id, screen: 'habits' },
        sound: 'default'
      });
    }
  }

  // Await all database updates (in parallel)
  if (updatePromises.length > 0) {
    await Promise.all(updatePromises);
  }

  return messages;
}

// ── Expo push sending ───────────────────────────────────────────────────────

async function sendExpoPushBatch(messages: PushMessage[]) {
  if (messages.length === 0) return { chunks: 0 };

  const chunks: PushMessage[][] = [];
  for (let i = 0; i < messages.length; i += EXPO_CHUNK_SIZE) {
    chunks.push(messages.slice(i, i + EXPO_CHUNK_SIZE));
  }

  const results = [];
  for (const chunk of chunks) {
    const res = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
      },
      body: JSON.stringify(chunk),
    });
    const json = await res.json();
    results.push(json);

    // Expo returns per-message errors (e.g. DeviceNotRegistered) here.
    // Worth logging and pruning those tokens from push_tokens so future
    // batches don't keep sending to dead devices.
    if (json.data) {
      json.data.forEach((ticket: any, idx: number) => {
        if (ticket.status === 'error') {
          console.warn('[expo push error]', chunk[idx].to, ticket.message, ticket.details);
        }
      });
    }
  }

  return { chunks: chunks.length, results };
}
