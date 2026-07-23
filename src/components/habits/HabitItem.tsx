import { Text } from "@/components/ui/Text";
import { Habit, useLebenStore } from "@/store/useStore";
import { calcStreak } from "@/utils/habits";
import { useState } from "react";
import { Alert, TextInput, TouchableOpacity, View } from "react-native";

interface HabitItemProps {
  habit: Habit;
}

export function HabitItem({ habit }: HabitItemProps) {
  const toggleHabit = useLebenStore((s) => s.toggleHabit);
  const deleteHabit = useLebenStore((s) => s.deleteHabit);
  const editHabit = useLebenStore((s) => s.editHabit);

  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(habit.label);
  const [editSub, setEditSub] = useState(habit.sub);

  // Always derive checked state from completedDates (never stale)
  const now = new Date();
  const todayStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
  const isCheckedToday = (habit.completedDates ?? []).includes(todayStr);

  // Recalculate streak live from completedDates
  const currentStreak = calcStreak(habit.completedDates ?? []);

  const handleSave = () => {
    editHabit(habit.id, { label: editLabel, sub: editSub });
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Habit",
      `Are you sure you want to delete "${habit.label}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteHabit(habit.id),
        },
      ],
    );
  };

  return (
    <View
      className={`rounded-2xl p-5 border bg-leben-bg-card ${isCheckedToday ? `border-[#${habit.color}55]` : "border-leben-border-subtle"} `}
    >
      {/* Top row: icon + actions */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        {/* Icon */}
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: `${habit.color}18`,
            borderWidth: 1,
            borderColor: `${habit.color}22`,
          }}
        >
          <Text style={{ fontSize: 20 }}>{habit.icon}</Text>
        </View>

        {/* Edit / Delete */}
        <View style={{ flexDirection: "row", gap: 4 }}>
          <TouchableOpacity
            onPress={() => {
              setEditLabel(habit.label);
              setEditSub(habit.sub);
              setIsEditing(true);
            }}
            style={{ padding: 6 }}
          >
            <Text style={{ fontSize: 13 }}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={{ padding: 6 }}>
            <Text style={{ fontSize: 13 }}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Edit form or label display */}
      {isEditing ? (
        <View style={{ gap: 8, marginBottom: 16 }}>
          <TextInput
            autoFocus
            value={editLabel}
            onChangeText={setEditLabel}
            className="bg-leben-bg-secondary border border-leben-border-subtle rounded-lg px-2.5 py-1.5 text-leben-text text-[14px]"
            placeholder="Habit Label"
            placeholderTextColor="#555" // Keep or replace if needed
          />
          <TextInput
            value={editSub}
            onChangeText={setEditSub}
            className="bg-leben-bg-secondary border border-leben-border-subtle rounded-lg px-2.5 py-1.5 text-leben-text text-[11px]"
            placeholder="Subtext"
            placeholderTextColor="#555"
          />
          <TouchableOpacity
            onPress={handleSave}
            style={{
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 6,
              backgroundColor: habit.color,
              alignItems: "center",
              marginTop: 4,
            }}
          >
            <Text className="text-white font-semibold text-[12px]">Save</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text className="text-[15px] font-bold text-leben-text mb-0.5">
            {habit.label}
          </Text>
          <Text className="text-[11px] text-leben-text-secondary mb-1">
            {habit.sub}
          </Text>
        </>
      )}

      {/* Best streak */}
      <Text className="text-[10px] text-leben-text-dim mb-3.5">
        Best: {habit.longestStreak}d
      </Text>

      {/* Bottom row: done status + toggle */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          className="text-[10px] text-leben-text-secondary"
          style={{ color: isCheckedToday ? habit.color : "#555" }}
        >
          {isCheckedToday
            ? `Done today ✓  🔥${currentStreak}`
            : `Not yet  🔥${currentStreak}`}
        </Text>

        <TouchableOpacity
          onPress={() => toggleHabit(habit.id)}
          className="w-[30px] h-[30px] rounded-full items-center justify-center border-2 border-leben-border-subtle"
          style={{
            backgroundColor: isCheckedToday
              ? `${habit.color}22`
              : "transparent",
            borderColor: isCheckedToday ? habit.color : undefined,
          }}
          activeOpacity={0.7}
        >
          {isCheckedToday && (
            <Text
              style={{ color: habit.color, fontSize: 12, fontWeight: "700" }}
            >
              ✓
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
