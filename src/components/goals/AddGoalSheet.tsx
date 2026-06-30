import { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLebenStore } from '@/store/useStore';
import { GoalFormData } from '@/utils/goals.types';

const ICON_OPTIONS = [
  "🌐", "🏃", "🚀", "💰", "📚",
  "🎯", "🧠", "🎨", "💪", "🌱",
];

interface AddGoalSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function AddGoalSheet({ visible, onClose }: AddGoalSheetProps) {
  const addGoal = useLebenStore((s: any) => s.addGoal);

  const [form, setForm] = useState<GoalFormData>({
    title: "",
    deadline: "",
    icon: "🎯",
    milestones: ["", "", ""],
    color: "#7c6af0",
    targetValue: 100,
    currentValue: 0,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof GoalFormData, string>>>({});

  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.title.trim()) next.title = "Goal title is required";
    if (!form.deadline.trim()) next.deadline = "Deadline is required";
    const filledMilestones = form.milestones.filter((m) => m.trim() !== "");
    if (filledMilestones.length === 0) next.milestones = "Add at least one milestone";
    
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    addGoal(form);
    resetForm();
    onClose();
  }

  function updateMilestone(index: number, value: string) {
    const updated = [...form.milestones];
    updated[index] = value;
    setForm({ ...form, milestones: updated });
  }

  function addMilestoneField() {
    setForm({
      ...form,
      milestones: [...form.milestones, ""],
    });
  }

  function resetForm() {
    setForm({
      title: "",
      deadline: "",
      icon: "🎯",
      milestones: ["", "", ""],
      color: "#7c6af0",
      targetValue: 100,
      currentValue: 0,
    });
    setErrors({});
  }

  function handleCancel() {
    resetForm();
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleCancel}>
      <SafeAreaView className="flex-1" style={{ backgroundColor: '#0a0a0a' }}>
        <View className="flex-1 px-5 pt-4">
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="font-black text-white text-[20px]" style={{ letterSpacing: -0.4 }}>
              New Goal
            </Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            <View className="gap-5 pb-8">
              
              {/* Icon picker */}
              <View>
                <Text style={{ fontSize: 10, color: '#555', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
                  Icon
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {ICON_OPTIONS.map((icon) => (
                    <TouchableOpacity
                      key={icon}
                      onPress={() => setForm({ ...form, icon })}
                      className="rounded-xl items-center justify-center"
                      style={{
                        width: 36,
                        height: 36,
                        borderWidth: 1,
                        borderColor: form.icon === icon ? '#7c6af0' : '#2a2a2a',
                        backgroundColor: form.icon === icon ? 'rgba(124,106,240,0.15)' : '#161616',
                      }}
                    >
                      <Text style={{ fontSize: 18 }}>{icon}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Title */}
              <View>
                <Text style={{ fontSize: 10, color: '#555', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
                  Goal Title
                </Text>
                <TextInput
                  value={form.title}
                  onChangeText={(text) => setForm({ ...form, title: text })}
                  placeholder="e.g. Master Spanish"
                  placeholderTextColor="#555"
                  className="w-full rounded-xl px-4 py-3 text-white"
                  style={{
                    backgroundColor: '#161616',
                    borderWidth: 1,
                    borderColor: errors.title ? '#e05c5c' : '#2a2a2a',
                    fontSize: 14,
                  }}
                />
                {errors.title ? (
                  <Text style={{ fontSize: 11, color: '#e05c5c', marginTop: 4 }}>{errors.title}</Text>
                ) : null}
              </View>

              {/* Deadline */}
              <View>
                <Text style={{ fontSize: 10, color: '#555', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
                  Deadline
                </Text>
                <TextInput
                  value={form.deadline}
                  onChangeText={(text) => setForm({ ...form, deadline: text })}
                  placeholder="YYYY-MM (or YYYY-MM-DD)"
                  placeholderTextColor="#555"
                  className="w-full rounded-xl px-4 py-3 text-white"
                  style={{
                    backgroundColor: '#161616',
                    borderWidth: 1,
                    borderColor: errors.deadline ? '#e05c5c' : '#2a2a2a',
                    fontSize: 14,
                  }}
                />
                {errors.deadline ? (
                  <Text style={{ fontSize: 11, color: '#e05c5c', marginTop: 4 }}>{errors.deadline}</Text>
                ) : null}
              </View>

              {/* Milestones */}
              <View>
                <Text style={{ fontSize: 10, color: '#555', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
                  Milestones
                </Text>
                <View className="gap-2">
                  {form.milestones.map((m, i) => (
                    <TextInput
                      key={i}
                      value={m}
                      onChangeText={(text) => updateMilestone(i, text)}
                      placeholder={`Milestone ${i + 1}`}
                      placeholderTextColor="#555"
                      className="w-full rounded-xl px-4 py-3 text-white"
                      style={{
                        backgroundColor: '#161616',
                        borderWidth: 1,
                        borderColor: '#2a2a2a',
                        fontSize: 13,
                      }}
                    />
                  ))}
                </View>
                {errors.milestones ? (
                  <Text style={{ fontSize: 11, color: '#e05c5c', marginTop: 4 }}>{errors.milestones}</Text>
                ) : null}
                <TouchableOpacity onPress={addMilestoneField} className="mt-3">
                  <Text style={{ fontSize: 12, color: '#7c6af0' }}>+ Add milestone</Text>
                </TouchableOpacity>
              </View>

              {/* Actions */}
              <View className="flex-row gap-3 mt-4">
                <TouchableOpacity
                  onPress={handleCancel}
                  className="flex-1 py-3 rounded-xl items-center justify-center"
                  style={{
                    backgroundColor: '#161616',
                    borderWidth: 1,
                    borderColor: '#2a2a2a',
                  }}
                >
                  <Text style={{ color: '#888', fontSize: 13, fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={handleSubmit}
                  className="flex-1 py-3 rounded-xl items-center justify-center"
                  style={{
                    backgroundColor: '#f0f0f0',
                  }}
                >
                  <Text style={{ color: '#0a0a0a', fontSize: 13, fontWeight: '600' }}>Create Goal</Text>
                </TouchableOpacity>
              </View>

            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
