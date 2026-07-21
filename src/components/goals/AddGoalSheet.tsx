import { useState } from 'react';
import { View, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useLebenStore } from '@/store/useStore';
import { GoalFormData } from '@/utils/goals.types';
import { BottomSheet } from '@/components/ui/BottomSheet';
import ReminderPicker from '@/components/shared/ReminderPicker';
import { Text } from '@/components/ui/Text';


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
    reminderAt: undefined,
  });
  const [showReminder, setShowReminder] = useState(false);

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
    <BottomSheet visible={visible} onClose={handleCancel}>
      <View className="mb-6 flex-row items-center justify-between">
        <Text className="font-black text-white text-[20px]" style={{ letterSpacing: -0.4 }}>
          New Goal
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="max-h-[85%]">
        <View className="gap-5 pb-8">
          
          {/* Icon picker */}
          <View>
            <Text className="text-[10px] text-leben-text-muted tracking-[1px] uppercase mb-2">
              Icon
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {ICON_OPTIONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  onPress={() => setForm({ ...form, icon })}
                  className={`rounded-xl items-center justify-center border w-[36px] h-[36px] ${
                    form.icon === icon ? 'bg-leben-accent/15 border-leben-accent' : 'bg-leben-bg-card border-leben-border-subtle'
                  }`}
                >
                  <Text style={{ fontSize: 18 }}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Title */}
          <View>
            <Text className="text-[10px] text-leben-text-muted tracking-[1px] uppercase mb-2">
              Goal Title
            </Text>
            <TextInput
              value={form.title}
              onChangeText={(text) => setForm({ ...form, title: text })}
              placeholder="e.g. Master Spanish"
              placeholderTextColor="#555"
              className={`w-full rounded-xl px-4 py-3 text-leben-text text-[14px] bg-leben-bg-card border ${
                errors.title ? 'border-leben-error' : 'border-leben-border-subtle'
              }`}
            />
            {errors.title ? (
              <Text style={{ fontSize: 11, color: '#e05c5c', marginTop: 4 }}>{errors.title}</Text>
            ) : null}
          </View>

          {/* Deadline */}
          <View>
            <Text className="text-[10px] text-leben-text-muted tracking-[1px] uppercase mb-2">
              Deadline
            </Text>
            <TextInput
              value={form.deadline}
              onChangeText={(text) => setForm({ ...form, deadline: text })}
              placeholder="YYYY-MM (or YYYY-MM-DD)"
              placeholderTextColor="#555"
              className={`w-full rounded-xl px-4 py-3 text-leben-text text-[14px] bg-leben-bg-card border ${
                errors.deadline ? 'border-leben-error' : 'border-leben-border-subtle'
              }`}
            />
            {errors.deadline ? (
              <Text style={{ fontSize: 11, color: '#e05c5c', marginTop: 4 }}>{errors.deadline}</Text>
            ) : null}
          </View>

          {/* Milestones */}
          <View>
            <Text className="text-[10px] text-leben-text-muted tracking-[1px] uppercase mb-2">
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
                  className="w-full rounded-xl px-4 py-3 text-leben-text text-[13px] bg-leben-bg-card border border-leben-border-subtle"
                />
              ))}
            </View>
            {errors.milestones ? (
              <Text style={{ fontSize: 11, color: '#e05c5c', marginTop: 4 }}>{errors.milestones}</Text>
            ) : null}
            <TouchableOpacity onPress={addMilestoneField} className="mt-3">
              <Text className="text-[12px] text-leben-accent">+ Add milestone</Text>
            </TouchableOpacity>
          </View>

          {/* Actions */}
          <View className="flex-row items-center justify-between mt-4">
            <TouchableOpacity onPress={() => setShowReminder(true)} className="flex-row items-center gap-1.5 p-2 bg-leben-bg-secondary rounded-lg border border-leben-border">
              <Text className="text-leben-text-muted text-[12px]">{form.reminderAt ? new Date(form.reminderAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Add Reminder"}</Text>
            </TouchableOpacity>

            <View className="flex-row gap-3 flex-1 ml-3">
              <TouchableOpacity
                onPress={handleCancel}
                className="flex-1 py-3 rounded-xl items-center justify-center bg-leben-bg-card border border-leben-border-subtle"
              >
                <Text className="text-leben-text-muted text-[13px] font-semibold">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleSubmit}
                className="flex-1 py-3 rounded-xl items-center justify-center bg-leben-text"
              >
                <Text className="text-leben-bg font-semibold text-[13px]">Create Goal</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </ScrollView>

      {showReminder && (
        <View style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
          <ReminderPicker
            initialValue={form.reminderAt}
            onSave={(val) => { setForm({ ...form, reminderAt: val }); setShowReminder(false); }}
            onClose={() => setShowReminder(false)}
          />
        </View>
      )}
    </BottomSheet>
  );
}
