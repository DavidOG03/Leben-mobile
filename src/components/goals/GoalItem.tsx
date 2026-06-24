import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Goal, deriveGoalStats, Milestone } from '@/utils/goals.types';
import { useLebenStore } from '@/store/useStore';
import { Card } from '@/components/ui/Card';

interface GoalItemProps {
  goal: Goal;
}

export function GoalItem({ goal }: GoalItemProps) {
  const removeGoal = useLebenStore((s) => s.removeGoal);
  const updateGoal = useLebenStore((s) => s.editGoal);
  const toggleMilestone = useLebenStore((s) => s.toggleMilestone);
  
  const { progress, status, statusColor } = deriveGoalStats(goal);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(goal.title);
  const [editDeadline, setEditDeadline] = useState(goal.deadline);
  const [editMilestones, setEditMilestones] = useState<Milestone[]>(goal.milestones);

  const handleSave = () => {
    updateGoal(goal.id, {
      title: editTitle,
      deadline: editDeadline,
      milestones: editMilestones,
    });
    setIsEditing(false);
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      setEditTitle(goal.title);
      setEditDeadline(goal.deadline);
      setEditMilestones([...goal.milestones]);
    }
    setIsEditing(!isEditing);
  };

  return (
    <Card className="p-5 mb-4" style={{ backgroundColor: '#111', borderColor: '#1e1e1e' }}>
      {/* Header Row */}
      <View className="flex-row items-start justify-between mb-4">
        <View 
          className="w-12 h-12 rounded-xl items-center justify-center border border-[#252535]"
          style={{ backgroundColor: '#141428' }}
        >
          <Text className="text-[22px]">{goal.icon}</Text>
        </View>

        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={handleEditToggle}>
            <Text className="text-[#888] text-sm">✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => removeGoal(goal.id)}>
            <Text className="text-[#888] text-sm">🗑️</Text>
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
            className="bg-[#1a1a1a] border border-[#333] text-white px-3 py-2 rounded-lg text-[14px]"
            placeholder="Goal Title"
            placeholderTextColor="#666"
          />
          <TextInput
            value={editDeadline}
            onChangeText={setEditDeadline}
            className="bg-[#1a1a1a] border border-[#333] text-white px-3 py-2 rounded-lg text-[12px]"
            placeholder="Deadline (YYYY-MM-DD)"
            placeholderTextColor="#666"
          />
        </View>
      ) : (
        <View className="mb-4">
          <Text className="text-white font-bold text-[20px] tracking-tight leading-tight mb-1">
            {goal.title}
          </Text>
          <Text className="text-[#555] text-[11px]">
            Deadline: {goal.deadline}
          </Text>
        </View>
      )}

      {/* Progress Bar */}
      <View className="mb-5">
        <View className="flex-row justify-between mb-2">
          <Text className="text-[#555] text-[11px] font-medium">Progress</Text>
          <Text className="text-[#888] text-[11px] font-medium">{progress}%</Text>
        </View>
        <View className="h-[3px] rounded-full bg-[#1e1e1e] overflow-hidden">
          <View 
            className="h-full rounded-full"
            style={{ width: `${progress}%`, backgroundColor: '#7c6af0' }} 
          />
        </View>
      </View>

      {/* Milestones */}
      <Text className="text-[#444] text-[9px] uppercase tracking-widest font-bold mb-3">
        Milestones
      </Text>

      <View className="gap-2">
        {isEditing ? (
          <>
            {editMilestones.map((m, index) => (
              <View key={m.id} className="flex-row items-center gap-2 mb-2 pb-2 border-b border-[#222]">
                <View 
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor: m.completed ? 'rgba(124,106,240,0.2)' : 'transparent',
                    borderColor: m.completed ? '#7c6af0' : '#333',
                    borderWidth: 1,
                  }}
                />
                <TextInput
                  value={m.title}
                  onChangeText={(text) => {
                    const newM = [...editMilestones];
                    newM[index].title = text;
                    setEditMilestones(newM);
                  }}
                  className="flex-1 bg-[#1a1a1a] text-[#eee] text-[12px] px-2 py-1.5 rounded border border-[#333]"
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
            <TouchableOpacity
              onPress={() => {
                setEditMilestones([
                  ...editMilestones,
                  { id: Math.random().toString(36).substring(7), title: '', completed: false }
                ]);
              }}
              className="mt-2 py-2"
            >
              <Text className="text-leben-accent text-[11px] font-semibold">+ Add Milestone</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              className="mt-4 bg-leben-accent rounded-lg py-3 items-center"
            >
              <Text className="text-white font-semibold text-[13px]">Save Changes</Text>
            </TouchableOpacity>
          </>
        ) : (
          goal.milestones.map((m) => (
            <View key={m.id} className="flex-row items-center gap-3 w-full">
              <TouchableOpacity
                onPress={() => toggleMilestone(goal.id, m.id)}
                className="w-4 h-4 rounded-full items-center justify-center shrink-0"
                style={{
                  backgroundColor: m.completed ? 'rgba(124,106,240,0.2)' : 'transparent',
                  borderColor: m.completed ? '#7c6af0' : '#333',
                  borderWidth: 1,
                }}
              >
                {m.completed && <Text className="text-leben-accent text-[8px]">✓</Text>}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => toggleMilestone(goal.id, m.id)}
                className="flex-1"
              >
                <Text 
                  className="text-[12px] leading-snug"
                  style={{ color: m.completed ? '#888' : '#ccc', textDecorationLine: m.completed ? 'line-through' : 'none' }}
                >
                  {m.title}
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </Card>
  );
}
