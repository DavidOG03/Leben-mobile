// hooks/useNotifications.ts
import { useEffect, useRef }   from 'react';
import { Platform, Linking }   from 'react-native';
import { savePushToken }       from '@/lib/supabase/db';
import { useLebenStore }       from '@/store/useStore';
import Constants               from 'expo-constants';
import * as Notifications      from 'expo-notifications';
import * as Device             from 'expo-device';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound:   true,
    shouldSetBadge:    false,
    shouldShowAlert:   true,
    shouldShowBanner:  true,
    shouldShowList:    true,
  }),
});

export function useNotifications() {
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener     = useRef<Notifications.EventSubscription | null>(null);
  const userId               = useLebenStore((s) => s.userId);
  const notificationPrefs    = useLebenStore((s) => s.notificationPrefs);
  const goals                = useLebenStore((s) => s.goals);
  const habits               = useLebenStore((s) => s.habits);

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
    syncDailyReminders().catch((e) => console.error('[syncDailyReminders] err', e));
    syncGoalReminders().catch((e) => console.error('[syncGoalReminders] err', e));
  }, [notificationPrefs, goals, habits]);

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

    // Ask user to disable battery optimization so notifications fire reliably
    await requestBatteryOptimizationExemption();
  }
}

/**
 * Opens the system dialog asking the user to exempt this app from battery optimization.
 * This ensures scheduled notifications (morning briefing, streak savers, etc.) are
 * delivered reliably even when the app has been in the background for a long time.
 * Only prompts if not already exempted.
 */
async function requestBatteryOptimizationExemption(): Promise<void> {
  try {
    const packageName = 'com.david.lebenmobile';
    const url = `package:${packageName}`;

    // ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS opens a system dialog
    // that asks the user to allow the app to bypass battery optimization.
    const intentUrl = `android.settings.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`;

    const canOpen = await Linking.canOpenURL(`intent:${url}#Intent;action=${intentUrl};end`);
    if (canOpen) {
      await Linking.openURL(`intent:${url}#Intent;action=${intentUrl};end`);
    } else {
      // Fallback: open general battery optimization settings page
      await Linking.openSettings();
    }
  } catch (e) {
    // Non-fatal — some manufacturers restrict this intent
    console.warn('[Notifications] Could not open battery optimization settings:', e);
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
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 8,
        minute: 0,
      },
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
