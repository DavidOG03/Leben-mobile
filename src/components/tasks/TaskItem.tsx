import ReminderPicker from "@/components/shared/ReminderPicker";
import { Text } from "@/components/ui/Text";
import { cancelReminder, scheduleReminder } from "@/hooks/useNotifications";
import { useLebenStore } from "@/store/useStore";
import { useState } from "react";
import { Alert, TextInput, TouchableOpacity, View } from "react-native";

interface TaskItemProps {
  taskId: string;
  isLast: boolean;
}

export function TaskItem({ taskId, isLast }: TaskItemProps) {
  const task = useLebenStore((s) => s.tasks.find((t) => t.id === taskId));
  const toggleTask = useLebenStore((s) => s.toggleTask);
  const removeTask = useLebenStore((s) => s.removeTask);
  const editTask = useLebenStore((s) => s.editTask);

  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [showReminder, setShowReminder] = useState(false);

  if (!task) return null;

  const isWork = task.tag === "WORK";

  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      editTask(taskId, { title: editTitle.trim() });
    }
    setIsEditing(false);
  };

  const handleSaveReminder = async (isoDate: string | undefined) => {
    if (!isoDate) {
      await editTask(taskId, { reminderAt: null });
      await cancelReminder(taskId);
    } else {
      await editTask(taskId, { reminderAt: isoDate });
      await scheduleReminder({
        id: taskId,
        title: "Task Reminder",
        body: task.title,
        date: new Date(isoDate),
        screen: "tasks",
      });
    }
    setShowReminder(false);
  };

  return (
    <View className={`border-leben-border-subtle ${!isLast ? "border-b" : ""}`}>
      <View className="flex-row items-center gap-3 px-4 py-3.5 bg-transparent active:bg-white/[0.02]">
        {/* Checkbox */}
        <TouchableOpacity
          onPress={() => toggleTask(taskId)}
          className={`w-7 h-7 rounded-[5px] items-center justify-center border ${
            task.completed
              ? "border-leben-success bg-leben-success/20"
              : "border-leben-border bg-leben-bg-secondary"
          }`}
          activeOpacity={0.7}
        >
          {task.completed && (
            <Text className="text-leben-success text-[10px]">✓</Text>
          )}
        </TouchableOpacity>

        {/* Priority dot
        <View
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{
            backgroundColor:
              task.priority === "high"
                ? "#e85555"
                : task.priority === "low"
                  ? "#55e855"
                  : "#e8a855",
            shadowColor:
              task.priority === "high"
                ? "#e85555"
                : task.priority === "low"
                  ? "#55e855"
                  : "#e8a855",
            shadowOpacity: 0.5,
            shadowRadius: 4,
            elevation: 2,
          }}
        /> */}

        {/* Title */}
        <View className="flex-1 min-w-0 justify-center">
          {isEditing ? (
            <TextInput
              value={editTitle}
              onChangeText={setEditTitle}
              onBlur={handleSaveEdit}
              onSubmitEditing={handleSaveEdit}
              autoFocus
              className="text-leben-text-2 text-[13px] border-b border-leben-accent py-1"
              style={{ lineHeight: 18 }}
            />
          ) : (
            <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
              <Text
                className={`text-[13px] leading-[18px] ${
                  task.completed
                    ? "text-leben-text-dim line-through"
                    : "text-leben-text-secondary"
                }`}
              >
                {task.title}
              </Text>
            </TouchableOpacity>
          )}

          {task.reminderAt && !isEditing && (
            <View className="flex-row items-center gap-1 mt-1">
              <Text className="text-leben-accent text-[10px]">🔔</Text>
              <Text className="text-leben-accent text-[10px]">
                {new Date(task.reminderAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          )}
        </View>

        {/* Actions Button */}
        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          className="w-7 h-7 items-center justify-center rounded-lg active:bg-white/5"
        >
          <Text className="text-leben-text-muted text-lg leading-none">⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Expanded Actions */}
      {isExpanded && (
        <View className="flex-row items-center gap-2 px-4 pb-3 border-t border-leben-border-subtle pt-3">
          <TouchableOpacity
            onPress={() => setShowReminder(!showReminder)}
            className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg border ${
              task.reminderAt
                ? "bg-leben-accent/15 border-leben-accent"
                : "bg-transparent border-leben-border-subtle"
            }`}
          >
            <Text
              className={
                task.reminderAt ? "text-leben-accent" : "text-leben-text-muted"
              }
            >
              🔔
            </Text>
            <Text
              className={`text-[10px] font-geist-medium ${task.reminderAt ? "text-leben-accent" : "text-leben-text-muted"}`}
            >
              Reminder
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setEditTitle(task.title);
              setIsEditing(true);
              setIsExpanded(false);
            }}
            className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg border border-leben-border-subtle bg-transparent"
          >
            <Text className="text-leben-text-muted text-[10px]">✎</Text>
            <Text className="text-[10px] font-geist-medium text-leben-text-muted">
              Edit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              Alert.alert("Delete Task", `Delete "${task.title}"?`, [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => removeTask(taskId),
                },
              ])
            }
            className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10"
          >
            <Text className="text-red-400 text-[10px]">🗑</Text>
            <Text className="text-[10px] font-geist-medium text-red-400">
              Delete
            </Text>
          </TouchableOpacity>

          <View className="flex-1" />

          <View
            className={`rounded px-2 py-1 border ${
              isWork
                ? "bg-tag-work-bg border-tag-work-border"
                : "bg-tag-personal-bg border-tag-personal-border"
            }`}
          >
            <Text
              className={`text-[10px] font-geist-semibold ${
                isWork ? "text-tag-work-text" : "text-tag-personal-text"
              }`}
            >
              {task.tag}
            </Text>
          </View>
        </View>
      )}

      {/* Reminder Inline Form */}
      {showReminder && isExpanded && (
        <View className="px-4 pb-3">
          <ReminderPicker
            initialValue={task.reminderAt ?? undefined}
            onSave={handleSaveReminder}
            onClose={() => setShowReminder(false)}
          />
        </View>
      )}
    </View>
  );
}
