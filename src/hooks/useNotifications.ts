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
