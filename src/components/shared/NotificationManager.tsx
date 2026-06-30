import { useEffect, useRef, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Animated, { FadeInUp, FadeOutRight } from "react-native-reanimated";
import { useLebenStore } from "@/store/useStore";
import * as Notifications from "expo-notifications";
import { SparkleIcon } from "@/constants/Icons"; // we'll use a generic icon for the toast

interface Toast {
  id: string;
  title: string;
  body: string;
}

function ReminderToast({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 8000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <Animated.View
      entering={FadeInUp.duration(350)}
      exiting={FadeOutRight.duration(200)}
      style={styles.toastContainer}
    >
      <View style={styles.iconContainer}>
        <SparkleIcon />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{toast.title}</Text>
        <Text style={styles.body}>{toast.body}</Text>
      </View>

      <TouchableOpacity onPress={() => onDismiss(toast.id)} style={styles.closeButton}>
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function dayKey(isoString: string): string {
  return isoString.split("T")[0];
}

function notifKey(id: string, reminderAt: string): string {
  return `${id}::${dayKey(reminderAt)}`;
}

export default function NotificationManager() {
  const tasks    = useLebenStore((state) => state.tasks);
  const habits   = useLebenStore((state) => state.habits);
  const schedule = useLebenStore((state) => state.schedule);
  const goals    = useLebenStore((state) => state.goals);
  const books    = useLebenStore((state) => state.books);
  const addNotification = useLebenStore((state) => state.addNotification);

  const notifiedRef = useRef<Set<string>>(new Set());
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const fireNotification = useCallback(
    (id: string, reminderAt: string, title: string, body: string) => {
      const key = notifKey(id, reminderAt);
      if (notifiedRef.current.has(key)) return;
      notifiedRef.current.add(key);

      setToasts((prev) => [...prev, { id: `toast-${id}-${Date.now()}`, title, body }]);
      addNotification({ id: `${id}-${Date.now()}`, title, body });

      Notifications.getPermissionsAsync().then(({ status }) => {
        if (status === "granted") {
          Notifications.scheduleNotificationAsync({
            content: { title, body },
            trigger: null,
          });
        }
      });
    },
    [addNotification],
  );

  const streakNudgeRef = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    const checkStreakNudge = () => {
      const hour = new Date().getHours();
      // Check for daily digest between 7 PM and 10 PM
      if (hour < 19 || hour >= 22) return;
      
      const today = new Date().toISOString().split("T")[0];
      const digestKey = `daily-digest::${today}`;

      if (!streakNudgeRef.current.has(digestKey)) {
        streakNudgeRef.current.add(digestKey);

        const unfinishedTasks = tasks.filter((t: any) => !t.completed).length;
        const unfinishedHabits = habits.filter((h: any) => !h.checked);
        const activeGoals = goals.filter((g: any) => g.currentValue < g.targetValue);
        const activeBooks = books.filter((b: any) => b.status === "reading");

        const messages = [];
        if (unfinishedTasks > 0) messages.push(`${unfinishedTasks} unfinished tasks.`);
        if (unfinishedHabits.length > 0) messages.push(`${unfinishedHabits.length} habits to complete.`);
        if (activeGoals.length > 0) messages.push(`Make progress on: ${activeGoals[0].title}.`);
        if (activeBooks.length > 0) messages.push(`Read a few pages of ${activeBooks[0].title}.`);

        if (messages.length > 0) {
          const body = messages.join(" ");
          setToasts((prev) => [...prev, { id: digestKey, title: "Evening Digest 🌙", body }]);
          addNotification({ id: digestKey, title: "Evening Digest", body });

          Notifications.getPermissionsAsync().then(({ status }) => {
            if (status === "granted") {
              Notifications.scheduleNotificationAsync({
                content: { title: "Evening Digest 🌙", body },
                trigger: null,
              });
            }
          });
        }
      }
    };

    const interval = setInterval(checkStreakNudge, 60_000);
    checkStreakNudge();
    return () => clearInterval(interval);
  }, [tasks, habits, goals, books, addNotification]);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const twoMinutesAgo = new Date(now.getTime() - 120_000);

      const allRemindables = [
        ...tasks
          .filter((t: any) => !t.completed && t.reminderAt)
          .map((t: any) => ({ id: t.id, reminderAt: t.reminderAt, type: "Task Reminder", label: t.title || t.name })),
        ...habits
          .filter((h: any) => h.reminderAt)
          .map((h: any) => ({ id: h.id, reminderAt: h.reminderAt, type: "Habit Reminder", label: h.label || h.name })),
        ...schedule
          .filter((s: any) => s.status !== "completed" && s.reminderAt)
          .map((s: any) => ({ id: s.id, reminderAt: s.reminderAt, type: "Planner Reminder", label: s.title })),
        ...goals
          .filter((g: any) => g.currentValue < g.targetValue && g.reminderAt)
          .map((g: any) => ({ id: g.id, reminderAt: g.reminderAt, type: "Goal Reminder", label: g.title })),
        ...books
          .filter((b: any) => b.status === "reading" && b.reminderAt)
          .map((b: any) => ({ id: b.id, reminderAt: b.reminderAt, type: "Book Reminder", label: b.title })),
      ];

      allRemindables.forEach((item: any) => {
        const reminderTime = new Date(item.reminderAt);

        if (reminderTime <= now && reminderTime > twoMinutesAgo) {
          fireNotification(item.id, item.reminderAt, item.type, `Time for: ${item.label}`);
        } else if (reminderTime <= twoMinutesAgo) {
          const key = notifKey(item.id, item.reminderAt);
          notifiedRef.current.add(key);
        }
      });
    };

    const interval = setInterval(checkReminders, 10_000);
    checkReminders();
    return () => clearInterval(interval);
  }, [tasks, habits, schedule, goals, books, fireNotification]);

  if (toasts.length === 0) return null;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      {toasts.map((toast) => (
        <ReminderToast key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 50, // Display at the top of the screen just below the header
    left: 16,
    right: 16,
    zIndex: 9999,
    flexDirection: "column",
    gap: 8,
  },
  toastContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#1a1a1e",
    borderColor: "rgba(124,106,240,0.3)",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
    pointerEvents: "auto",
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(124,106,240,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 11,
    color: "#7c6af0",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  body: {
    marginTop: 4,
    fontSize: 13,
    color: "#e0e0e0",
    lineHeight: 18,
  },
  closeButton: {
    paddingHorizontal: 4,
  },
  closeText: {
    color: "#777",
    fontSize: 18,
    lineHeight: 18,
  },
});
