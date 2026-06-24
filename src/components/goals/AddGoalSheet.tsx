import { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { useLebenStore } from '@/store/useStore';
import { Milestone } from '@/utils/goals.types';

interface AddGoalSheetProps {
  visible: boolean;
  onClose: () => void;
}

const PRESET_ICONS = ['🚀', '💰', '🏋️‍♂️', '🎓', '🏆', '✈️', '💼', '🏡'];

export function AddGoalSheet({ visible, onClose }: AddGoalSheetProps) {
  const addGoal = useLebenStore((s) => s.addGoal);

  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('🚀');
  const [deadline, setDeadline] = useState('');
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [newMilestone, setNewMilestone] = useState('');

  const handleAddMilestone = () => {
    if (newMilestone.trim()) {
      setMilestones([
        ...milestones,
        { id: Math.random().toString(36).substring(7), title: newMilestone.trim(), completed: false },
      ]);
      setNewMilestone('');
    }
  };

  const handleSave = () => {
    if (!title.trim()) return;

    addGoal({
      id: Math.random().toString(36).substring(7),
      title: title.trim(),
      name: title.trim(),
      icon,
      deadline: deadline.trim() || new Date().toISOString().split('T')[0],
      milestones,
      tasksLinked: 0,
      targetValue: milestones.length || 100,
      currentValue: 0,
      createdAt: new Date().toISOString(),
    });

    setTitle('');
    setIcon('🚀');
    setDeadline('');
    setMilestones([]);
    setNewMilestone('');
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View className="mb-4">
        <Text className="text-white text-xl font-bold mb-1">New Goal</Text>
        <Text className="text-[#666] text-[13px]">Set a target and define the path.</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="max-h-[80%]">
        <View className="gap-5 pb-6">
          {/* Title */}
          <View className="gap-2">
            <Text className="text-[#888] text-[11px] uppercase tracking-widest font-semibold">Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Launch Mobile App"
              placeholderTextColor="#555"
              className="bg-[#131313] border border-[#222] text-white px-4 py-3.5 rounded-xl text-[15px]"
            />
          </View>

          {/* Icon */}
          <View className="gap-2">
            <Text className="text-[#888] text-[11px] uppercase tracking-widest font-semibold">Icon</Text>
            <View className="flex-row flex-wrap gap-2">
              {PRESET_ICONS.map((i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setIcon(i)}
                  className="w-10 h-10 rounded-lg items-center justify-center border"
                  style={{
                    backgroundColor: icon === i ? 'rgba(124,106,240,0.1)' : '#131313',
                    borderColor: icon === i ? '#7c6af0' : '#222',
                  }}
                >
                  <Text className="text-[20px]">{i}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Deadline */}
          <View className="gap-2">
            <Text className="text-[#888] text-[11px] uppercase tracking-widest font-semibold">Deadline</Text>
            <TextInput
              value={deadline}
              onChangeText={setDeadline}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#555"
              className="bg-[#131313] border border-[#222] text-white px-4 py-3.5 rounded-xl text-[15px]"
            />
          </View>

          {/* Milestones */}
          <View className="gap-2">
            <Text className="text-[#888] text-[11px] uppercase tracking-widest font-semibold">Milestones (Optional)</Text>
            
            {milestones.map((m, idx) => (
              <View key={m.id} className="flex-row items-center justify-between bg-[#1a1a1a] px-3 py-2.5 rounded-lg border border-[#222]">
                <Text className="text-[#ccc] text-[13px]">{m.title}</Text>
                <TouchableOpacity
                  onPress={() => setMilestones(milestones.filter((_, i) => i !== idx))}
                  className="p-1"
                >
                  <Text className="text-red-500 font-bold text-xs">✕</Text>
                </TouchableOpacity>
              </View>
            ))}

            <View className="flex-row items-center gap-2 mt-1">
              <TextInput
                value={newMilestone}
                onChangeText={setNewMilestone}
                onSubmitEditing={handleAddMilestone}
                placeholder="Add a milestone step..."
                placeholderTextColor="#555"
                className="flex-1 bg-[#131313] border border-[#222] text-white px-3 py-2.5 rounded-lg text-[13px]"
              />
              <TouchableOpacity
                onPress={handleAddMilestone}
                disabled={!newMilestone.trim()}
                className="px-4 py-3 rounded-lg items-center justify-center bg-[#222]"
                style={{ opacity: newMilestone.trim() ? 1 : 0.5 }}
              >
                <Text className="text-white font-medium text-[12px]">Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="mt-4">
            <Button 
              label="Create Goal" 
              onPress={handleSave} 
              disabled={!title.trim()}
            />
          </View>
        </View>
      </ScrollView>
    </BottomSheet>
  );
}
