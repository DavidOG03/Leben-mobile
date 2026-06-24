// hooks/useNotifications.ts
import { useEffect, useRef }   from 'react';
import * as Notifications      from 'expo-notifications';
import * as Device             from 'expo-device';
import { Platform }            from 'react-native';
import { savePushToken }       from '@/lib/supabase/db';
import { useLebenStore }       from '@/store/useStore';

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

  useEffect(() => {
    registerForPushNotifications();

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

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [userId]);

  return null;
}

// ── Registration ───────────────────────────────────────────────────────────────

async function registerForPushNotifications() {
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
      lightColor:   '#7c6af0',
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
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if (notif.content.data?.itemId === itemId) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }
}
