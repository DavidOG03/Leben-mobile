// hooks/useNotifications.ts
import { useEffect, useRef }   from 'react';
import { Platform }            from 'react-native';
import { savePushToken }       from '@/lib/supabase/db';
import { useLebenStore }       from '@/store/useStore';
import { useRouter }           from 'expo-router';
import Constants               from 'expo-constants';
import * as Notifications      from 'expo-notifications';
import * as Device             from 'expo-device';

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    return {
      shouldPlaySound:  true,
      shouldSetBadge:   false,
      shouldShowAlert:  true,
      shouldShowBanner: true,
      shouldShowList:   true,
    };
  },
});

export function useNotifications() {
  const router               = useRouter();
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener     = useRef<Notifications.EventSubscription | null>(null);
  const userId               = useLebenStore((s) => s.userId);
  const notificationPrefs    = useLebenStore((s) => s.notificationPrefs);
  const goals                = useLebenStore((s) => s.goals);
  const habits               = useLebenStore((s) => s.habits);
  const tasks                = useLebenStore((s) => s.tasks);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await registerForPushNotifications();

        // Clear any orphaned system/goal notifications that fired while the
        // app was killed so they don't reappear when the app reopens.
        await dismissStaleSystemNotifications();

        if (!mounted) return;

        // Listen for notifications received while app is open
        notificationListener.current = Notifications.addNotificationReceivedListener(
          (notification) => {
            console.log('[Notification received]', notification.request.content.title);
          },
        );

        // Listen for user tapping a notification
        responseListener.current = Notifications.addNotificationResponseReceivedListener(
          (response) => {
            const data = response.notification.request.content.data;
            console.log('[Notification tapped]', data);
            
            if (data && typeof data.screen === 'string') {
              const route = `/(tabs)/${data.screen}`;
              router.navigate(route as any);
            }
          },
        );
      } catch (e) {
        console.warn('Failed to initialize notifications', e);
      }
    })();

    return () => {
      mounted = false;
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [userId]);

  // Sync system and goal reminders when preferences or goals change.
  // Wrapped in a debounce ref to prevent concurrent calls from creating
  // duplicate scheduled DAILY notifications during rapid state updates.
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      syncDailyReminders().catch((e) => console.error('[syncDailyReminders] err', e));
      syncGoalReminders().catch((e) => console.error('[syncGoalReminders] err', e));
    }, 500);
    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, [notificationPrefs, goals, habits, tasks]);

  return null;
}

// ── Registration ───────────────────────────────────────────────────────────────

async function registerForPushNotifications() {
  // Request permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.warn('[Notifications] Permission not granted');
    return;
  }

  // Get Expo push token (only works on physical devices)
  if (Device.isDevice && Platform.OS !== 'web') {
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      const token     = tokenData.data;
      const platform  = Platform.OS;

      // Save to Supabase
      if (token) {
        await savePushToken(token, platform);
        console.log('[Notifications] Push token saved:', token);
      }
    } catch (e) {
      console.warn('[Notifications] Failed to fetch Expo push token:', e);
    }
  } else {
    console.log('[Notifications] Must use physical device for Push Notifications. Local notifications will still work.');
  }

  // Android channel setup (required)
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name:         'Leben Reminders',
      importance:   Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor:   '#7c6af0', // Match Leben accent
    });
  }
}

// ── Stale Notification Cleanup ────────────────────────────────────────────────

/**
 * Dismisses any already-delivered system or goal notifications from the
 * device notification tray. Called on startup so orphaned notifications
 * (scheduled before an app kill) don't resurface when the app reopens.
 * Task/habit reminders are intentionally left intact — the user may still
 * want to act on them.
 */
async function dismissStaleSystemNotifications(): Promise<void> {
  try {
    const presented = await Notifications.getPresentedNotificationsAsync();
    for (const notif of presented) {
      const itemId = notif.request.content.data?.itemId;
      if (
        typeof itemId === 'string' &&
        (itemId.startsWith('sys_') || itemId.startsWith('goal_'))
      ) {
        await Notifications.dismissNotificationAsync(notif.request.identifier);
      }
    }
  } catch (err) {
    console.error('[dismissStaleSystemNotifications]', err);
  }
}

// ── Schedule Local Notifications ──────────────────────────────────────────────

/**
 * Schedule a local reminder for a task or habit.
 * Call this after creating/editing an item with a reminderAt timestamp.
 */
export async function scheduleReminder(opts: {
  id:        string;
  title:     string;
  body?:     string;
  date:      Date;
  screen:    'tasks' | 'habits';
}): Promise<string | null> {
  try {
    // Cancel existing notification for this item first
    await cancelReminder(opts.id);

    const trigger = opts.date;
    if (trigger <= new Date()) return null; // Past — don't schedule

    const notifId = await Notifications.scheduleNotificationAsync({
      content: {
        title: opts.title,
        body:  opts.body ?? 'Reminder from Leben',
        data:  { itemId: opts.id, screen: opts.screen },
        sound: true,
        // Required on Android 8+ — must match a registered notification channel
        ...(Platform.OS === 'android' && { android: { channelId: 'default' } }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: trigger,
      },
    });
    return notifId;
  } catch (err) {
    console.error('[scheduleReminder]', err);
    return null;
  }
}

/**
 * Cancel a previously scheduled notification.
 */
export async function cancelReminder(itemId: string): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.content.data?.itemId === itemId) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }
  } catch (err) {
    console.error('[cancelReminder]', err);
  }
}

// ── System Reminders ────────────────────────────────────────────────────────

export async function syncDailyReminders(): Promise<void> {
  const prefs = useLebenStore.getState().notificationPrefs;

  // Cancel existing to avoid duplicates
  await cancelReminder('sys_morning_briefing');
  await cancelReminder('sys_midday_nudge');
  await cancelReminder('sys_evening_wrapup');
  await cancelReminder('sys_streak_saver');

  if (prefs.morningBriefing) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Good Morning! ☀️",
        body: "Check out your day's plan and focus.",
        data: { itemId: 'sys_morning_briefing', screen: 'tasks' },
        sound: true,
        ...(Platform.OS === 'android' && { android: { channelId: 'default' } }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 8,
        minute: 0,
      },
    });
  }

  if (prefs.middayNudge) {
    // ── Midday nudge — only fires if user hasn't done anything yet ──────────
    // Snapshot today's progress at schedule-time (debounced with other syncs)
    // so the notification only fires when there is genuinely nothing done.
    const nudgeState   = useLebenStore.getState();
    const nudgeDateStr = new Date().toISOString().split('T')[0];

    const todayTasksDone = nudgeState.tasks.filter(
      (t) => (!t.date || t.date === nudgeDateStr) && t.completed,
    ).length;
    const todayHabitsDone = nudgeState.habits.filter(
      (h) => (h.completedDates ?? []).includes(nudgeDateStr),
    ).length;
    const todayBooksUpdated = nudgeState.books.filter((b) => {
      const updated = (b as any).updatedAt ?? (b as any).createdAt;
      return updated && (updated as string).startsWith(nudgeDateStr);
    }).length;

    const hasActiveTasks  = nudgeState.tasks.filter(
      (t) => !t.date || t.date === nudgeDateStr,
    ).length > 0;
    const hasActiveHabits = nudgeState.habits.length > 0;
    const hasActiveGoals  = nudgeState.goals.length > 0;

    const hasDoneNothing  = todayTasksDone === 0 && todayHabitsDone === 0 && todayBooksUpdated === 0;
    const hasAnythingToDo = hasActiveTasks || hasActiveHabits || hasActiveGoals;

    if (hasDoneNothing && hasAnythingToDo) {
      const nudgeParts: string[] = [];
      if (hasActiveTasks)              nudgeParts.push('tasks');
      if (hasActiveHabits)             nudgeParts.push('habits');
      if (nudgeState.books.length > 0) nudgeParts.push('reading');
      if (hasActiveGoals)              nudgeParts.push('goals');

      const listStr =
        nudgeParts.length > 1
          ? nudgeParts.slice(0, -1).join(', ') + ' & ' + nudgeParts[nudgeParts.length - 1]
          : nudgeParts[0] ?? 'your day';

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Time to get moving! 🚀',
          body:  `Your ${listStr} are waiting. Make today count — let's go! 💪`,
          data:  { itemId: 'sys_midday_nudge', screen: 'tasks' },
          sound: true,
          ...(Platform.OS === 'android' && { android: { channelId: 'default' } }),
        },
        trigger: {
          type:   Notifications.SchedulableTriggerInputTypes.DAILY,
          hour:   12,
          minute: 0,
        },
      });
    }
    // ───────────────────────────────────────────────────────────────────────
  }

  if (prefs.eveningWrapUp) {
    // ── Dynamic evening message ─────────────────────────────────────────────
    // Compute today's progress at the time of scheduling so the content
    // reflects the user's actual day. The notification is rescheduled every
    // time tasks or habits change (debounced), so by 8 PM it will hold the
    // most recent snapshot of the day's work.
    const storeState   = useLebenStore.getState();
    const todayStr     = new Date().toISOString().split('T')[0];
    const todayTasks   = storeState.tasks.filter(
      (t) => !t.date || t.date === todayStr,
    );
    const completedCount  = todayTasks.filter((t) => t.completed).length;
    const totalCount      = todayTasks.length;
    const habitsToday     = storeState.habits.filter(
      (h) => (h.completedDates ?? []).includes(todayStr),
    );
    const habitsCount     = habitsToday.length;

    const hasDoneAnything = completedCount > 0 || habitsCount > 0;

    let eveningTitle = 'Evening Wrap-up 🌙';
    let eveningBody: string;

    if (hasDoneAnything) {
      // Build the achievement summary
      const parts: string[] = [];
      if (completedCount > 0) {
        parts.push(
          totalCount > 0
            ? `${completedCount}/${totalCount} task${completedCount > 1 ? 's' : ''} done`
            : `${completedCount} task${completedCount > 1 ? 's' : ''} done`,
        );
      }
      if (habitsCount > 0) {
        const names = habitsToday
          .slice(0, 2)
          .map((h) => h.label)
          .join(' & ');
        parts.push(
          habitsCount === 1
            ? `your ${names} habit kept`
            : `${habitsCount} habits tracked`,
        );
      }

      const ACCOLADES = [
        'You crushed it today!',
        "What a day — you showed up and delivered!",
        'Absolutely brilliant work today!',
        'Keep that energy going — you\'re on fire!',
        'Proud of you — another solid day in the books!',
        'You\'re building something great, one day at a time!',
      ];
      const accolade = ACCOLADES[Math.floor(Math.random() * ACCOLADES.length)];

      eveningTitle  = 'Evening Wrap-up 🌙✨';
      eveningBody   = `${accolade} ${parts.join(' & ')}. Rest up and do it again tomorrow 🔥`;
    } else {
      eveningBody = "Time to log your progress and plan tomorrow.";
    }
    // ───────────────────────────────────────────────────────────────────────

    await Notifications.scheduleNotificationAsync({
      content: {
        title: eveningTitle,
        body:  eveningBody,
        data:  { itemId: 'sys_evening_wrapup', screen: 'tasks' },
        sound: true,
        ...(Platform.OS === 'android' && { android: { channelId: 'default' } }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 20,
        minute: 0,
      },
    });
  }

  const today = new Date().toISOString().split('T')[0];
  const habits = useLebenStore.getState().habits;
  const allHabitsDone = habits.length > 0 && habits.every(h => h.completedDates.includes(today));

  // Only schedule if they haven't finished all habits today
  if (prefs.streakSavers && !allHabitsDone) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Don't break your streak! 🔥",
        body: "You haven't completed your daily habits yet. Clock in now!",
        data: { itemId: 'sys_streak_saver', screen: 'habits' },
        sound: true,
        ...(Platform.OS === 'android' && { android: { channelId: 'default' } }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 18,
        minute: 0,
      },
    });
  }
}

export async function syncGoalReminders(): Promise<void> {
  const state = useLebenStore.getState();
  const prefs = state.notificationPrefs;
  const goals = state.goals;

  // First cancel all goal reminders
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    const itemId = notif.content.data?.itemId;
    if (typeof itemId === 'string' && itemId.startsWith('goal_')) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }

  if (!prefs.goalUpdates) return;

  const now = new Date();

  for (const goal of goals) {
    if (!goal.deadline) continue;
    
    const createdAt = new Date(goal.createdAt || goal.deadline);
    const deadline = new Date(goal.deadline);
    
    // Skip if already past deadline
    if (deadline <= now) continue;

    // Midpoint Reminder
    const midpointTime = createdAt.getTime() + (deadline.getTime() - createdAt.getTime()) / 2;
    const midpointDate = new Date(midpointTime);
    
    if (midpointDate > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Goal Mid-point Check-in 🎯",
          body: `You are halfway to your deadline for "${goal.title}". Keep it up!`,
          data: { itemId: `goal_mid_${goal.id}`, screen: 'goals' },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: midpointDate,
        },
      });
    }

    // Deadline Approaching (3 days before)
    const warningTime = deadline.getTime() - (3 * 24 * 60 * 60 * 1000);
    const warningDate = new Date(warningTime);
    
    if (warningDate > now && warningDate > createdAt) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Deadline Approaching! ⏳",
          body: `Only 3 days left to achieve "${goal.title}". You can do this!`,
          data: { itemId: `goal_warn_${goal.id}`, screen: 'goals' },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: warningDate,
        },
      });
    }
  }
}
