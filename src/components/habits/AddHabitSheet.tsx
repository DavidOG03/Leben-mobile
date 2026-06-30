import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLebenStore } from '@/store/useStore';

interface AddHabitSheetProps {
  visible: boolean;
  onClose: () => void;
}

const HABIT_COLORS = ['#7c6af0', '#f06a6a', '#f0a86a', '#f0f06a', '#6af086', '#6aebf0'];
const HABIT_ICONS  = ['🎯', '💧', '🏃', '📚', '🧘', '🥗', '✍️', '🎸', '💻', '🌅', '🏋️', '🧠'];

export function AddHabitSheet({ visible, onClose }: AddHabitSheetProps) {
  const addHabit = useLebenStore((s) => s.addHabit);

  const [label, setLabel] = useState('');
  const [sub,   setSub]   = useState('');
  const [icon,  setIcon]  = useState('🎯');
  const [color, setColor] = useState(HABIT_COLORS[0]);

  const handleAdd = () => {
    if (!label.trim()) return;

    addHabit({
      id:             `h${Date.now()}`,
      label:          label.trim(),
      name:           label.trim(),
      sub:            sub.trim() || 'Daily habit',
      streak:         0,
      longestStreak:  0,
      color,
      icon,
      checked:        false,
      completedDates: [],
      pct:            0,
      frequency:      'daily',
      targetDaysPerWeek: 7,
      timeOfDay:      'anytime',
      createdAt:      new Date().toISOString(),
    });

    // Reset form
    setLabel('');
    setSub('');
    setIcon('🎯');
    setColor(HABIT_COLORS[0]);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView className="flex-1" style={{ backgroundColor: '#0a0a0a' }}>
        <View className="flex-1 px-5 pt-4">
          {/* Header */}
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="font-black text-white text-[20px]" style={{ letterSpacing: -0.4 }}>
              New Habit
            </Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            <View className="gap-5 pb-8">
              {/* Icon */}
              <View>
                <Text style={sectionLabel}>Icon</Text>
                <View className="flex-row flex-wrap gap-2">
                  {HABIT_ICONS.map((ic) => (
                    <TouchableOpacity
                      key={ic}
                      onPress={() => setIcon(ic)}
                      className="rounded-xl items-center justify-center"
                      style={{
                        width: 38,
                        height: 38,
                        backgroundColor: icon === ic ? 'rgba(124,106,240,0.15)' : '#161616',
                        borderWidth: 1,
                        borderColor: icon === ic ? '#7c6af0' : '#2a2a2a',
                      }}
                    >
                      <Text style={{ fontSize: 18 }}>{ic}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Color */}
              <View>
                <Text style={sectionLabel}>Color</Text>
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
                        borderColor: '#fff',
                        shadowColor: color === c ? c : 'transparent',
                        shadowOpacity: color === c ? 0.6 : 0,
                        shadowRadius: 4,
                        elevation: color === c ? 4 : 0,
                      }}
                    />
                  ))}
                </View>
              </View>

              {/* Name */}
              <View>
                <Text style={sectionLabel}>Habit Name</Text>
                <TextInput
                  value={label}
                  onChangeText={setLabel}
                  placeholder="e.g. Cold Shower"
                  placeholderTextColor="#555"
                  style={inputStyle}
                />
              </View>

              {/* Target / Sub */}
              <View>
                <Text style={sectionLabel}>Target</Text>
                <TextInput
                  value={sub}
                  onChangeText={setSub}
                  placeholder="e.g. 5 mins every morning"
                  placeholderTextColor="#555"
                  style={inputStyle}
                />
              </View>

              {/* Buttons */}
              <View className="flex-row gap-3 mt-4">
                <TouchableOpacity
                  onPress={onClose}
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
                  onPress={handleAdd}
                  disabled={!label.trim()}
                  className="flex-1 py-3 rounded-xl items-center justify-center"
                  style={{
                    backgroundColor: label.trim() ? '#f0f0f0' : '#2a2a2a',
                  }}
                >
                  <Text style={{ color: label.trim() ? '#0a0a0a' : '#555', fontSize: 13, fontWeight: '600' }}>
                    Add Habit
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const sectionLabel = {
  fontSize: 11,
  color: '#555',
  marginBottom: 8,
  textTransform: 'uppercase' as const,
  letterSpacing: 1.2,
};

const inputStyle = {
  backgroundColor: '#1a1a1a',
  borderWidth: 1,
  borderColor: '#2a2a2a',
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 12,
  color: '#fff',
  fontSize: 13,
  marginBottom: 12,
};
