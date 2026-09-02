import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';

const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND_NOTIFICATION_TASK';

TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async () => {
  try {
    const now = new Date().getTime();
    
    // 1. Get all scheduled notifications (scheduled by AlarmManager)
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    
    // 2. Iterate through them to see if any are past due
    for (const notif of scheduled) {
      const trigger = notif.trigger as any;
      
      // If it's a specific date trigger (e.g. custom task reminder)
      if (trigger && trigger.type === 'date' && typeof trigger.value === 'number') {
        const scheduledTime = trigger.value;
        
        // If it's past due (AlarmManager failed to fire it), we manually fire it now
        if (scheduledTime < now) {
          await Notifications.scheduleNotificationAsync({
            content: notif.content as unknown as Notifications.NotificationContentInput,
            trigger: null, // Fire immediately
          });
          
          // And remove the orphaned one
          await Notifications.cancelScheduledNotificationAsync(notif.identifier);
        }
      }
      
      // If it's a daily repeating trigger (e.g. system nudges)
      if (trigger && trigger.type === 'daily') {
        const d = new Date();
        d.setHours(trigger.hour, trigger.minute, 0, 0);
        const scheduledTodayTime = d.getTime();
        
        // If today's time has passed by more than 5 minutes (to avoid duplicate with AlarmManager)
        if (now > scheduledTodayTime + (5 * 60 * 1000)) {
          // Check if it's already in the tray
          const presented = await Notifications.getPresentedNotificationsAsync();
          const alreadyPresented = presented.some(p => 
            p.request.content.data?.itemId === notif.content.data?.itemId
          );
          
          if (!alreadyPresented) {
            // We fire it manually as a fallback
            await Notifications.scheduleNotificationAsync({
              content: notif.content as unknown as Notifications.NotificationContentInput,
              trigger: null, 
            });
          }
        }
      }
    }
    
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (err) {
    console.error('[BackgroundTask]', err);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export async function registerBackgroundFetchAsync() {
  try {
    await BackgroundTask.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK, {
      minimumInterval: 15, // 15 minutes (in minutes, not seconds)
    });
    console.log('[BackgroundTask] Task registered successfully');
  } catch (err) {
    console.error('[BackgroundTask] Registration failed:', err);
  }
}

