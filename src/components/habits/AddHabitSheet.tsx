import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { useLebenStore } from '@/store/useStore';
import { LC } from '@/constants/theme';

interface AddHabitSheetProps {
  visible: boolean;
  onClose: () => void;
}

const PRESET_COLORS = ['#7c6af0', '#f06a6a', '#f0a86a', '#f0f06a', '#6af086', '#6aebf0'];
const PRESET_ICONS = ['💧', '🏃', '📚', '🧘', '🥗', '✍️', '🎸', '💻'];

export function AddHabitSheet({ visible, onClose }: AddHabitSheetProps) {
  const addHabit = useLebenStore((s) => s.addHabit);

  const [label, setLabel] = useState('');
  const [icon, setIcon] = useState('💧');
  const [color, setColor] = useState('#7c6af0');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [targetDaysPerWeek, setTargetDays] = useState(7);
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'anytime'>('anytime');

  const handleSave = () => {
    if (!label.trim()) return;

    addHabit({
      id: Math.random().toString(36).substring(7),
      name: label.trim(),
      label: label.trim(),
      sub: frequency === 'daily' ? 'Daily' : `${targetDaysPerWeek}x a week`,
      icon,
      color,
      frequency,
      targetDaysPerWeek: frequency === 'daily' ? 7 : targetDaysPerWeek,
      timeOfDay,
      createdAt: new Date().toISOString(),
      streak: 0,
      longestStreak: 0,
      pct: 0,
      completedDates: [],
      checked: false,
    });

    // Reset form
    setLabel('');
    setIcon('💧');
    setColor('#7c6af0');
    setFrequency('daily');
    setTargetDays(7);
    setTimeOfDay('anytime');
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View className="mb-4">
        <Text className="text-white text-xl font-bold mb-1">New Habit</Text>
        <Text className="text-[#666] text-[13px]">Define what you want to build.</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="max-h-[80%]">
        <View className="gap-5 pb-6">
          {/* Label Input */}
          <View className="gap-2">
            <Text className="text-[#888] text-[11px] uppercase tracking-widest font-semibold">Name</Text>
            <TextInput
              value={label}
              onChangeText={setLabel}
              placeholder="e.g. Drink Water"
              placeholderTextColor="#555"
              className="bg-[#131313] border border-[#222] text-white px-4 py-3.5 rounded-xl text-[15px]"
            />
          </View>

          {/* Icon & Color Row */}
          <View className="flex-row gap-4">
            <View className="flex-1 gap-2">
              <Text className="text-[#888] text-[11px] uppercase tracking-widest font-semibold">Icon</Text>
              <View className="flex-row flex-wrap gap-2">
                {PRESET_ICONS.map((i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setIcon(i)}
                    className="w-[38px] h-[38px] rounded-lg items-center justify-center border"
                    style={{
                      backgroundColor: icon === i ? 'rgba(124,106,240,0.1)' : '#131313',
                      borderColor: icon === i ? '#7c6af0' : '#222',
                    }}
                  >
                    <Text className="text-lg">{i}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="flex-1 gap-2">
              <Text className="text-[#888] text-[11px] uppercase tracking-widest font-semibold">Color</Text>
              <View className="flex-row flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setColor(c)}
                    className="w-[38px] h-[38px] rounded-lg items-center justify-center border"
                    style={{
                      backgroundColor: '#131313',
                      borderColor: color === c ? c : '#222',
                    }}
                  >
                    <View className="w-5 h-5 rounded-full" style={{ backgroundColor: c }} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Frequency */}
          <View className="gap-2">
            <Text className="text-[#888] text-[11px] uppercase tracking-widest font-semibold">Frequency</Text>
            <View className="flex-row gap-2">
              {(['daily', 'weekly'] as const).map((f) => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setFrequency(f)}
                  className="flex-1 py-3 rounded-lg border items-center justify-center"
                  style={{
                    backgroundColor: frequency === f ? 'rgba(124,106,240,0.1)' : '#131313',
                    borderColor: frequency === f ? '#7c6af0' : '#222',
                  }}
                >
                  <Text className="capitalize font-semibold text-[13px]" style={{ color: frequency === f ? '#7c6af0' : '#888' }}>
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Time of Day */}
          <View className="gap-2">
            <Text className="text-[#888] text-[11px] uppercase tracking-widest font-semibold">Time of Day</Text>
            <View className="flex-row flex-wrap gap-2">
              {(['anytime', 'morning', 'afternoon', 'evening'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setTimeOfDay(t)}
                  className="px-4 py-2.5 rounded-lg border items-center justify-center"
                  style={{
                    backgroundColor: timeOfDay === t ? 'rgba(124,106,240,0.1)' : '#131313',
                    borderColor: timeOfDay === t ? '#7c6af0' : '#222',
                  }}
                >
                  <Text className="capitalize font-medium text-[12px]" style={{ color: timeOfDay === t ? '#7c6af0' : '#888' }}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="mt-2">
            <Button 
              label="Create Habit" 
              onPress={handleSave} 
              disabled={!label.trim()}
            />
          </View>
        </View>
      </ScrollView>
    </BottomSheet>
  );
}
