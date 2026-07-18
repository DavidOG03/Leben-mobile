import { useState, useEffect } from 'react';
import { View, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useLebenStore } from '@/store/useStore';
import { Card } from '@/components/ui/Card';
import { scheduleReminder, cancelReminder } from '@/hooks/useNotifications';
import { Text } from '@/components/ui/Text';


export function HabitStreaks() {
  const router = useRouter();
  const habits = useLebenStore((s) => s.habits);
  const toggleHabit = useLebenStore((s) => s.toggleHabit);
  const updateHabit = useLebenStore((s) => s.editHabit); // Mapped to editHabit in store

  const [loading, setLoading] = useState(true);
  const [reminderHabit, setReminderHabit] = useState<string | null>(null);
  const [reminderTime, setReminderTime] = useState<string>('');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSetReminder = async (habitId: string, habitLabel: string) => {
    if (!reminderTime.includes(':')) {
      Alert.alert('Invalid Format', 'Please use HH:MM format (e.g. 14:30)');
      return;
    }

    const [hours, minutes] = reminderTime.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      Alert.alert('Invalid Time', 'Please enter a valid time.');
      return;
    }

    const now = new Date();
    const reminderDate = new Date();
    reminderDate.setHours(hours, minutes, 0, 0);

    if (reminderDate <= now) {
      reminderDate.setDate(reminderDate.getDate() + 1);
    }

    await updateHabit(habitId, { reminderAt: reminderDate.toISOString() });
    await scheduleReminder({
      id: habitId,
      title: 'Habit Reminder',
      body: `Time for: ${habitLabel}`,
      date: reminderDate,
      screen: 'habits',
    });

    setReminderHabit(null);
    setReminderTime('');
  };

  const handleClearReminder = async (habitId: string) => {
    await updateHabit(habitId, { reminderAt: null });
    await cancelReminder(habitId);
    setReminderHabit(null);
  };

  return (
    <Card className="min-h-[200px] p-6" style={{ backgroundColor: '#121212', borderColor: 'var(--border-primary)' }}>
      <View className="flex-row items-center justify-between mb-5">
        <Text className="text-white font-semibold text-[15px]">
          Habit Streaks
        </Text>
        {!loading && habits.length > 0 && (
          <TouchableOpacity onPress={() => router.push('/(tabs)/habits' as any)}>
            <Text className="text-leben-accent text-[11px] font-semibold">
              Go to Habits
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View className="flex-1 gap-4 opacity-50">
          {[1, 2].map((i) => (
            <View key={i} className="flex-row items-center gap-3">
              <View className="w-9 h-9 rounded-lg bg-leben-bg-secondary" />
              <View className="flex-1 gap-2">
                <View className="h-3 w-1/2 rounded bg-leben-bg-secondary" />
                <View className="h-2 w-1/3 rounded bg-leben-bg-secondary" />
              </View>
            </View>
          ))}
        </View>
      ) : habits.length === 0 ? (
        <View className="flex-1 items-center justify-center py-4 gap-3">
          <Text className="text-leben-text-dim text-2xl">十</Text>
          <Text className="text-leben-text-dim text-[11px]">
            No habits tracked yet
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/habits' as any)}
            className="px-4 py-1.5 rounded-lg border border-leben-border active:opacity-70"
          >
            <Text className="text-leben-text-dim text-[11px]">Set up habits</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex-1 gap-4">
          {habits.slice(0, 3).map((h) => (
            <View key={h.id}>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View 
                    className="w-9 h-9 rounded-lg items-center justify-center border border-leben-border"
                    style={{ backgroundColor: 'var(--bg-secondary)' }}
                  >
                    <Text style={{ color: h.color, fontSize: 18 }}>{h.icon}</Text>
                  </View>
                  <View className="gap-1">
                    <Text className="text-white font-medium text-[13px]">{h.label}</Text>
                    <Text className="text-leben-text-dim text-[11px]">🔥 {h.streak} day streak</Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    onPress={() => setReminderHabit(reminderHabit === h.id ? null : h.id)}
                    className="w-[26px] h-[26px] rounded-md items-center justify-center"
                    style={{
                      backgroundColor: h.reminderAt ? 'rgba(124, 106, 240, 0.15)' : 'transparent',
                      borderWidth: 1,
                      borderColor: h.reminderAt ? 'var(--accent-blue)' : 'transparent',
                    }}
                  >
                    <Text className={h.reminderAt ? 'text-leben-accent' : 'text-leben-text-dim'}>🔔</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => toggleHabit(h.id)}
                    className="w-[42px] h-[26px] rounded-lg items-center justify-center border border-leben-border"
                    style={{
                      backgroundColor: h.checked ? h.color : 'var(--bg-card)',
                    }}
                  >
                    <Text className="text-xs" style={{ color: h.checked ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {h.checked ? '✓' : '○'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {reminderHabit === h.id && (
                <View className="mt-3 flex-row items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5">
                  <TextInput
                    value={reminderTime}
                    onChangeText={setReminderTime}
                    placeholder="HH:MM"
                    placeholderTextColor="#555"
                    keyboardType="numbers-and-punctuation"
                    className="px-3 py-1.5 rounded bg-leben-bg border border-leben-border text-leben-text-2 text-xs flex-1"
                    maxLength={5}
                  />
                  <TouchableOpacity
                    onPress={() => handleSetReminder(h.id, h.label)}
                    disabled={!reminderTime}
                    className="px-4 py-1.5 rounded"
                    style={{
                      backgroundColor: reminderTime ? 'var(--accent-blue)' : 'transparent',
                      borderWidth: 1,
                      borderColor: 'var(--accent-blue)',
                      opacity: reminderTime ? 1 : 0.5,
                    }}
                  >
                    <Text className="text-white text-xs">Set</Text>
                  </TouchableOpacity>
                  {h.reminderAt && (
                    <TouchableOpacity
                      onPress={() => handleClearReminder(h.id)}
                      className="px-4 py-1.5 rounded border border-leben-border"
                    >
                      <Text className="text-leben-text-muted text-xs">Clear</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          ))}
          {habits.length > 3 && (
            <TouchableOpacity onPress={() => router.push('/(tabs)/habits' as any)} className="mt-auto pt-2 items-center">
              <Text className="text-leben-text-dim text-[11px]">
                See all {habits.length} habits
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </Card>
  );
}
