// hooks/useNotifications.ts
import { useEffect, useRef }   from 'react';
import { Platform }            from 'react-native';
import { savePushToken }       from '@/lib/supabase/db';
import { useLebenStore }       from '@/store/useStore';
import Constants               from 'expo-constants';

// Only import types to avoid triggering the runtime crash in Expo Go
import type * as NotificationsType from 'expo-notifications';

const isExpoGo = Constants.appOwnership === 'expo';

// Configure how notifications appear when app is in foreground
// Wrap in an IIFE so it only runs if not in Expo Go
if (!isExpoGo) {
  (async () => {
    try {
      const Notifications = await import('expo-notifications');
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldPlaySound:   true,
          shouldSetBadge:    false,
          shouldShowAlert:   true,
          shouldShowBanner:  true,
          shouldShowList:    true,
        }),
      });
    } catch (e) {
      console.warn('Failed to load expo-notifications', e);
    }
  })();
}

export function useNotifications() {
  const notificationListener = useRef<NotificationsType.EventSubscription | null>(null);
  const responseListener     = useRef<NotificationsType.EventSubscription | null>(null);
  const userId               = useLebenStore((s) => s.userId);
  const notificationPrefs    = useLebenStore((s) => s.notificationPrefs);
  const goals                = useLebenStore((s) => s.goals);
  const habits               = useLebenStore((s) => s.habits);

  useEffect(() => {
    if (isExpoGo) return;

    let mounted = true;
    (async () => {
      try {
        const Notifications = await import('expo-notifications');
        
        await registerForPushNotifications(Notifications);
        
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
            // TODO: navigate to the relevant screen based on data.screen
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

  // Sync system and goal reminders when preferences or goals change
  useEffect(() => {
    if (isExpoGo) return;
    syncDailyReminders().catch((e) => console.error('[syncDailyReminders] err', e));
    syncGoalReminders().catch((e) => console.error('[syncGoalReminders] err', e));
  }, [notificationPrefs, goals, habits]);

  return null;
}

// ── Registration ───────────────────────────────────────────────────────────────

async function registerForPushNotifications(Notifications: typeof NotificationsType) {
  const Device = await import('expo-device');
  if (!Device.isDevice || Platform.OS === 'web') {
    // Push notifications only work on physical mobile devices
    return;
  }

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

  // Get Expo push token
  const tokenData = await Notifications.getExpoPushTokenAsync();
  const token     = tokenData.data;
  const platform  = Platform.OS;

  // Save to Supabase
  await savePushToken(token, platform);
  console.log('[Notifications] Push token saved:', token);

  // Android channel setup (required)
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name:         'Leben Reminders',
      importance:   Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor:   'var(--accent-blue)',
    });
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
  if (isExpoGo) return null;
  
  try {
    const Notifications = await import('expo-notifications');
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
  if (isExpoGo) return;
  
  try {
    const Notifications = await import('expo-notifications');
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
  if (isExpoGo) return;
  const prefs = useLebenStore.getState().notificationPrefs;
  const Notifications = await import('expo-notifications');

  // Cancel existing to avoid duplicates
  await cancelReminder('sys_morning_briefing');
  await cancelReminder('sys_evening_wrapup');
  await cancelReminder('sys_streak_saver');

  if (prefs.morningBriefing) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Good Morning! ☀️",
        body: "Check out your day's plan and focus.",
        data: { itemId: 'sys_morning_briefing', screen: 'tasks' },
        sound: true,
      },
      trigger: {
        hour: 8,
        minute: 0,
        repeats: true,
      } as any,
    });
  }
  
  if (prefs.eveningWrapUp) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Evening Wrap-up 🌙",
        body: "Time to log your progress and plan tomorrow.",
        data: { itemId: 'sys_evening_wrapup', screen: 'tasks' },
        sound: true,
      },
      trigger: {
        hour: 20,
        minute: 0,
        repeats: true,
      } as any,
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
      },
      trigger: {
        hour: 18,
        minute: 0,
        repeats: true,
      } as any,
    });
  }
}

export async function syncGoalReminders(): Promise<void> {
  if (isExpoGo) return;
  const state = useLebenStore.getState();
  const prefs = state.notificationPrefs;
  const goals = state.goals;

  const Notifications = await import('expo-notifications');
  
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
