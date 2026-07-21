import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { useLebenStore } from "@/store/useStore";
import {
  Goal,
  Milestone,
  deriveGoalStats,
  generateMilestoneId,
} from "@/utils/goals.types";
import { useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";

interface GoalItemProps {
  goal: Goal;
}

export function GoalItem({ goal }: GoalItemProps) {
  const removeGoal = useLebenStore((s) => s.removeGoal);
  const editGoal = useLebenStore((s) => s.editGoal);
  const toggleMilestone = useLebenStore((s) => s.toggleMilestone);

  const safeGoal = { ...goal, milestones: goal.milestones ?? [] };
  const { progress, status, statusColor } = deriveGoalStats(safeGoal);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(goal.title);
  const [editDeadline, setEditDeadline] = useState(goal.deadline ?? "");
  const [editMilestones, setEditMilestones] = useState<Milestone[]>(
    safeGoal.milestones,
  );

  const handleSave = () => {
    editGoal(goal.id, {
      title: editTitle,
      deadline: editDeadline,
      milestones: editMilestones,
    });
    setIsEditing(false);
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      setEditTitle(goal.title);
      setEditDeadline(goal.deadline ?? "");
      setEditMilestones([...safeGoal.milestones]);
    }
    setIsEditing(!isEditing);
  };

  return (
    <Card className="p-5 mb-4 bg-leben-bg-card border border-leben-border-subtle">
      {/* Header Row */}
      <View className="flex-row items-start justify-between mb-4">
        <View
          className="w-12 h-12 rounded-xl items-center justify-center border border-[#252535]"
          style={{ backgroundColor: "#141428" }}
        >
          <Text className="text-[22px]">{goal.icon}</Text>
        </View>

        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={handleEditToggle}>
            <Text className="text-leben-text-muted text-sm">✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => removeGoal(goal.id)}>
            <Text className="text-leben-text-muted text-sm">🗑️</Text>
          </TouchableOpacity>
          <View
            className="px-2 py-1 rounded"
            style={{ borderColor: `${statusColor}44`, borderWidth: 1 }}
          >
            <Text
              className="text-[9px] uppercase tracking-widest font-semibold"
              style={{ color: statusColor }}
            >
              {status}
            </Text>
          </View>
        </View>
      </View>

      {/* Title & Deadline */}
      {isEditing ? (
        <View className="gap-2 mb-4">
          <TextInput
            value={editTitle}
            onChangeText={setEditTitle}
            className="bg-leben-bg-secondary border border-leben-border text-leben-text px-3 py-2 rounded-lg text-[14px]"
            placeholder="Goal Title"
            placeholderTextColor="#666"
            autoFocus
          />
          <TextInput
            value={editDeadline}
            onChangeText={setEditDeadline}
            className="bg-leben-bg-secondary border border-leben-border text-leben-text px-3 py-2 rounded-lg text-[11px]"
            placeholder="Deadline (e.g. Dec 2025)"
            placeholderTextColor="#666"
          />
        </View>
      ) : (
        <View className="mb-4">
          <Text className="text-leben-text font-bold text-[20px] tracking-tight leading-tight mb-1">
            {goal.title}
          </Text>
          <Text className="text-leben-text-muted text-[11px]">
            Deadline: {goal.deadline}
          </Text>
        </View>
      )}

      {/* Progress Bar */}
      <View className="mb-5">
        <View className="flex-row justify-between mb-2">
          <Text className="text-leben-text-muted text-[11px] font-medium">
            Progress
          </Text>
          <Text className="text-leben-text-muted text-[11px] font-medium">
            {progress}%
          </Text>
        </View>
        <View className="h-[3px] rounded-full bg-leben-border overflow-hidden">
          <View
            className="h-full rounded-full bg-leben-accent"
            style={{ width: `${progress}%` }}
          />
        </View>
      </View>

      {/* Milestones label */}
      <Text className="text-leben-text-dim text-[9px] uppercase tracking-widest font-bold mb-3">
        Milestones
      </Text>

      <View className="gap-2">
        {isEditing ? (
          <>
            {editMilestones.map((m, index) => (
              <View
                key={m.id}
                className="flex-row items-center gap-2 mb-2 pb-2 border-b border-leben-border"
              >
                {/* Done indicator (non-interactive in edit mode) */}
                <View
                  className={`w-4 h-4 rounded-full border ${
                    m.done
                      ? "bg-leben-accent/20 border-leben-accent"
                      : "bg-transparent border-leben-border-subtle"
                  }`}
                />
                <TextInput
                  value={m.label}
                  onChangeText={(text) => {
                    const newM = [...editMilestones];
                    newM[index] = { ...newM[index], label: text };
                    setEditMilestones(newM);
                  }}
                  className="flex-1 bg-leben-bg-secondary text-[#eee] text-[12px] px-2 py-1.5 rounded border border-leben-border"
                  placeholder="Milestone label"
                  placeholderTextColor="#555"
                />
                <TouchableOpacity
                  onPress={() => {
                    const newM = [...editMilestones];
                    newM.splice(index, 1);
                    setEditMilestones(newM);
                  }}
                  className="px-2 py-1"
                >
                  <Text className="text-red-500 font-bold text-sm">✕</Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* Add Milestone */}
            <TouchableOpacity
              onPress={() =>
                setEditMilestones([
                  ...editMilestones,
                  { id: generateMilestoneId(), label: "", done: false },
                ])
              }
              className="mt-1 py-2"
            >
              <Text className="text-leben-accent text-[11px] font-semibold">
                + Add Milestone
              </Text>
            </TouchableOpacity>

            {/* Save */}
            <TouchableOpacity
              onPress={handleSave}
              className="mt-3 bg-leben-accent rounded-lg py-3 items-center"
            >
              <Text className="text-leben-text font-semibold text-[13px]">
                Save Changes
              </Text>
            </TouchableOpacity>
          </>
        ) : safeGoal.milestones.length === 0 ? (
          <Text className="text-leben-text-dim text-[12px]">
            No milestones yet.
          </Text>
        ) : (
          safeGoal.milestones.map((m) => (
            <View key={m.id} className="flex-row items-center gap-3 w-full">
              {/* Checkbox */}
              <TouchableOpacity
                onPress={() => toggleMilestone(goal.id, m.id)}
                className={`w-4 h-4 rounded-full items-center justify-center shrink-0 border ${
                  m.done
                    ? "bg-leben-accent/20 border-leben-accent"
                    : "bg-transparent border-leben-border-subtle"
                }`}
              >
                {m.done && (
                  <Text className="text-leben-accent text-[8px]">✓</Text>
                )}
              </TouchableOpacity>

              {/* Label — tappable */}
              <TouchableOpacity
                onPress={() => toggleMilestone(goal.id, m.id)}
                className="flex-1"
              >
                <Text
                  className={`text-[12px] leading-snug ${
                    m.done
                      ? "text-leben-text-muted line-through"
                      : "text-leben-text-secondary"
                  }`}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </Card>
  );
}
