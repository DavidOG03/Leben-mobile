import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { cancelReminder, scheduleReminder } from "@/hooks/useNotifications";
import { useLebenStore } from "@/store/useStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, TextInput, TouchableOpacity, View } from "react-native";

function truncateWords(text: string, maxWords = 4) {
  const words = text.trim().split(/\s+/);
  return words.length > maxWords
    ? `${words.slice(0, maxWords).join(" ")}…`
    : text;
}

export function TodaysFocus() {
  const router = useRouter();
  const tasks = useLebenStore((s) => s.tasks);
  const toggleTask = useLebenStore((s) => s.toggleTask);
  const deleteTask = useLebenStore((s) => s.removeTask); // NOTE: mapped to removeTask in zustand
  const updateTask = useLebenStore((s) => s.editTask); // NOTE: mapped to editTask in zustand
  const [reminderTask, setReminderTask] = useState<string | null>(null);
  const [reminderTime, setReminderTime] = useState<string>("");

  const handleToggleTask = (taskId: string) => toggleTask(taskId);

  const handleSetReminder = async (taskId: string, taskTitle: string) => {
    if (!reminderTime.includes(":")) {
      Alert.alert("Invalid Format", "Please use HH:MM format (e.g. 14:30)");
      return;
    }

    const [hours, minutes] = reminderTime.split(":").map(Number);
    if (
      isNaN(hours) ||
      isNaN(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      Alert.alert("Invalid Time", "Please enter a valid time.");
      return;
    }

    const now = new Date();
    const reminderDate = new Date();
    reminderDate.setHours(hours, minutes, 0, 0);

    if (reminderDate <= now) {
      reminderDate.setDate(reminderDate.getDate() + 1); // tomorrow if past
    }

    await updateTask(taskId, { reminderAt: reminderDate.toISOString() });
    await scheduleReminder({
      id: taskId,
      title: "Task Reminder",
      body: taskTitle,
      date: reminderDate,
      screen: "tasks",
    });

    setReminderTask(null);
    setReminderTime("");
  };

  const handleClearReminder = async (taskId: string) => {
    await updateTask(taskId, { reminderAt: null });
    await cancelReminder(taskId);
    setReminderTask(null);
  };

  return (
    <Card className="min-h-[200px] p-0 overflow-hidden bg-leben-bg-card border border-leben-border-subtle">
      {/* Header */}
      <View className="flex-row items-center justify-between p-6 pb-4">
        <Text className="text-leben-text font-semibold text-[15px]">
          Today's Focus
        </Text>
        {tasks.length > 0 && (
          <TouchableOpacity onPress={() => router.push("/(tabs)/tasks" as any)}>
            <Text className="text-leben-accent text-[11px] font-semibold">
              Go to Tasks
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {tasks.length === 0 ? (
        <View className="flex-1 items-center justify-center py-6 gap-3">
          <Text className="text-leben-text-dim text-2xl">十</Text>
          <Text className="text-leben-text-dim text-xs text-center leading-relaxed">
            No tasks yet
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/tasks" as any)}
            className="px-4 py-1.5 rounded-lg border border-leben-border active:opacity-70"
          >
            <Text className="text-leben-text-dim text-[11px]">
              Add your first task
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          {tasks.map((task, i) => {
            const isLast = i === tasks.length - 1;
            const isWork = task.tag === "WORK";

            return (
              <View key={task.id}>
                <View
                  className={`flex-row items-center gap-3 px-5 py-4 ${!isLast ? "border-b border-leben-border-subtle" : ""}`}
                >
                  {/* Checkbox */}
                  <TouchableOpacity
                    onPress={() => handleToggleTask(task.id)}
                    className={`w-[18px] h-[18px] rounded-[5px] items-center justify-center border ${
                      task.completed
                        ? "border-leben-success bg-leben-success/20"
                        : "border-leben-border-subtle bg-leben-bg-secondary"
                    }`}
                    activeOpacity={0.7}
                  >
                    {task.completed && (
                      <Text className="text-leben-success text-[10px]">✓</Text>
                    )}
                  </TouchableOpacity>

                  {/* Title */}
                  <Text
                    className={`flex-1 text-[13px] leading-snug ${
                      task.completed
                        ? "text-leben-text-dim line-through"
                        : "text-leben-text-secondary"
                    }`}
                    numberOfLines={1}
                  >
                    {truncateWords(task.title, 4)}
                  </Text>

                  {/* Right side: Tag + Date */}
                  <View className="items-end gap-1.5">
                    {task.tag && (
                      <View
                        className={`rounded px-2 py-0.5 border ${
                          isWork
                            ? "bg-leben-accent/10 border-leben-accent/20"
                            : "bg-green-500/10 border-green-500/20"
                        }`}
                      >
                        <Text
                          className={`text-[9px] font-medium tracking-widest ${
                            isWork ? "text-leben-accent" : "text-green-500"
                          }`}
                        >
                          {task.tag}
                        </Text>
                      </View>
                    )}
                    {task.date && (
                      <Text className="text-[10px] text-leben-text-dim">
                        {task.date}
                      </Text>
                    )}
                  </View>

                  {/* Reminder Toggle */}
                  <TouchableOpacity
                    onPress={() =>
                      setReminderTask(reminderTask === task.id ? null : task.id)
                    }
                    className={`w-7 h-7 rounded-md items-center justify-center ml-1 border ${
                      task.reminderAt
                        ? "bg-leben-accent/15 border-leben-accent"
                        : "bg-transparent border-transparent"
                    }`}
                  >
                    <Text
                      className={
                        task.reminderAt
                          ? "text-leben-accent"
                          : "text-leben-text-dim"
                      }
                    >
                      🔔
                    </Text>
                  </TouchableOpacity>

                  {/* Delete (always visible on mobile vs hover on web) */}
                  <TouchableOpacity
                    onPress={() => deleteTask(task.id)}
                    className="w-7 h-7 items-center justify-center"
                  >
                    <Text className="text-leben-text-dim text-xs">🗑️</Text>
                  </TouchableOpacity>
                </View>

                {/* Reminder Picker Inline */}
                {reminderTask === task.id && (
                  <View className="px-5 py-3 flex-row items-center gap-2 bg-white/5 border-t border-white/5">
                    <TextInput
                      value={reminderTime}
                      onChangeText={setReminderTime}
                      placeholderTextColor="gray"
                      className="px-3 py-1.5 rounded bg-leben-bg border border-leben-border text-leben-text-2 text-xs w-20"
                      maxLength={5}
                    />
                    <TouchableOpacity
                      onPress={() => handleSetReminder(task.id, task.title)}
                      disabled={!reminderTime}
                      className={`px-4 py-1.5 rounded border ${
                        reminderTime
                          ? "bg-leben-accent border-leben-accent opacity-100"
                          : "bg-transparent border-leben-accent opacity-50"
                      }`}
                    >
                      <Text className="text-leben-bg-card text-xs">Set</Text>
                    </TouchableOpacity>
                    {task.reminderAt && (
                      <TouchableOpacity
                        onPress={() => handleClearReminder(task.id)}
                        className="px-4 py-1.5 rounded border border-leben-border"
                      >
                        <Text className="text-leben-text-muted text-xs">
                          Clear
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </Card>
  );
}
