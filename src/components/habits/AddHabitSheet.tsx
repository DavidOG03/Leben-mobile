import ReminderPicker from "@/components/shared/ReminderPicker";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Text } from "@/components/ui/Text";
import { useLebenStore } from "@/store/useStore";
import { scheduleReminder } from "@/hooks/useNotifications";
import { useState } from "react";
import { ScrollView, TextInput, TouchableOpacity, View } from "react-native";

interface AddHabitSheetProps {
  visible: boolean;
  onClose: () => void;
}

const HABIT_COLORS = [
  "#7c6af0",
  "#f06a6a",
  "#f0a86a",
  "#f0f06a",
  "#6af086",
  "#6aebf0",
];
const HABIT_ICONS = [
  "🎯",
  "💧",
  "🏃",
  "📚",
  "🧘",
  "🥗",
  "✍️",
  "🎸",
  "💻",
  "🌅",
  "🏋️",
  "🧠",
];

export function AddHabitSheet({ visible, onClose }: AddHabitSheetProps) {
  const addHabit = useLebenStore((s) => s.addHabit);

  const [label, setLabel] = useState("");
  const [sub, setSub] = useState("");
  const [icon, setIcon] = useState("🎯");
  const [color, setColor] = useState(HABIT_COLORS[0]);
  const [reminderAt, setReminderAt] = useState<string | undefined>();
  const [showReminder, setShowReminder] = useState(false);

  const handleAdd = async () => {
    if (!label.trim()) return;

    const habitId = `h${Date.now()}`;

    await addHabit({
      id: habitId,
      label: label.trim(),
      name: label.trim(),
      sub: sub.trim() || "Daily habit",
      streak: 0,
      longestStreak: 0,
      color,
      icon,
      checked: false,
      completedDates: [],
      pct: 0,
      frequency: "daily",
      targetDaysPerWeek: 7,
      timeOfDay: "anytime",
      createdAt: new Date().toISOString(),
      reminderAt,
    });

    // Schedule the OS-level notification if a reminder was set
    if (reminderAt) {
      await scheduleReminder({
        id: habitId,
        title: 'Habit Reminder',
        body: `Time for: ${label.trim()}`,
        date: new Date(reminderAt),
        screen: 'habits',
      });
    }

    // Reset form
    setLabel("");
    setSub("");
    setIcon("🎯");
    setColor(HABIT_COLORS[0]);
    setReminderAt(undefined);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      {/* Header */}
      <View className="mb-6 flex-row items-center justify-between">
        <Text
          className="font-black text-leben-text text-[20px]"
          style={{ letterSpacing: -0.4 }}
        >
          New Habit
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="max-h-[85%]">
        <View className="gap-5 pb-8">
          {/* Icon */}
          <View>
            <Text className="text-[11px] text-leben-text-muted mb-2 tracking-[1.2px] uppercase">Icon</Text>
            <View className="flex-row flex-wrap gap-2">
              {HABIT_ICONS.map((ic) => (
                <TouchableOpacity
                  key={ic}
                  onPress={() => setIcon(ic)}
                  className={`rounded-xl items-center justify-center border w-[38px] h-[38px] ${
                    icon === ic ? "bg-leben-accent/15 border-leben-accent" : "bg-leben-bg-secondary border-leben-border-subtle"
                  }`}
                >
                  <Text style={{ fontSize: 18 }}>{ic}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Color */}
          <View>
            <Text className="text-[11px] text-leben-text-muted mb-2 tracking-[1.2px] uppercase">Color</Text>
            <View className="flex-row gap-2">
              {HABIT_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setColor(c)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: c,
                    borderWidth: color === c ? 2 : 0,
                    borderColor: "#fff",
                    boxShadow: color === c ? `0px 2px 4px ${c}80` : "none",
                  }}
                />
              ))}
            </View>
          </View>

          {/* Name */}
          <View>
            <Text className="text-[11px] text-leben-text-muted mb-2 tracking-[1.2px] uppercase">Habit Name</Text>
            <TextInput
              value={label}
              onChangeText={setLabel}
              placeholder="e.g. Cold Shower"
              placeholderTextColor="gray"
              className="bg-leben-bg-secondary border border-leben-border-subtle rounded-xl px-4 py-3 text-leben-text text-[13px] mb-3"
            />
          </View>

          {/* Target / Sub */}
          <View>
            <Text className="text-[11px] text-leben-text-muted mb-2 tracking-[1.2px] uppercase">Target</Text>
            <TextInput
              value={sub}
              onChangeText={setSub}
              placeholder="e.g. 5 mins every morning"
              placeholderTextColor="gray"
              className="bg-leben-bg-secondary border border-leben-border-subtle rounded-xl px-4 py-3 text-leben-text text-[13px] mb-3"
            />
          </View>

          {/* Buttons */}
          <View className="flex-row items-center justify-between mt-4">
            <TouchableOpacity
              onPress={() => setShowReminder(true)}
              className="flex-row items-center gap-1.5 p-2 bg-leben-bg-secondary rounded-lg border border-leben-border"
            >
              <Text className="text-leben-text-muted text-[12px]">
                {reminderAt
                  ? new Date(reminderAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Add Reminder"}
              </Text>
            </TouchableOpacity>

            <View className="flex-row gap-3 flex-1 ml-3">
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 py-3 rounded-xl items-center justify-center bg-leben-bg-secondary border border-leben-border-subtle"
              >
                <Text
                  className="text-leben-text-muted text-[13px] font-semibold"
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAdd}
                disabled={!label.trim()}
                className={`flex-1 py-3 rounded-xl items-center justify-center bg-leben-text ${
                  !label.trim() ? "opacity-50" : ""
                }`}
              >
                <Text
                  className={`text-[14px] font-semibold ${
                    label.trim() ? "text-leben-bg" : "text-leben-text-muted"
                  }`}
                >
                  Add Habit
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {showReminder && (
        <View style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
          <ReminderPicker
            initialValue={reminderAt}
            onSave={(val) => {
              setReminderAt(val);
              setShowReminder(false);
            }}
            onClose={() => setShowReminder(false)}
          />
        </View>
      )}
    </BottomSheet>
  );
}


