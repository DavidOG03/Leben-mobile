import { useState, useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useLebenStore } from '@/store/useStore';
import { Card } from '@/components/ui/Card';
import { scheduleReminder, cancelReminder } from '@/hooks/useNotifications';
import { Text } from '@/components/ui/Text';
import ReminderPicker from '@/components/shared/ReminderPicker';


export function HabitStreaks() {
  const router = useRouter();
  const habits = useLebenStore((s) => s.habits);
  const toggleHabit = useLebenStore((s) => s.toggleHabit);
  const updateHabit = useLebenStore((s) => s.editHabit); // Mapped to editHabit in store

  const [loading, setLoading] = useState(true);
  const [reminderHabit, setReminderHabit] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSaveReminder = async (habitId: string, habitLabel: string, isoDate: string | undefined) => {
    if (!isoDate) {
      await updateHabit(habitId, { reminderAt: null });
      await cancelReminder(habitId);
    } else {
      await updateHabit(habitId, { reminderAt: isoDate });
      await scheduleReminder({
        id: habitId,
        title: 'Habit Reminder',
        body: `Time for: ${habitLabel}`,
        date: new Date(isoDate),
        screen: 'habits',
      });
    }
    setReminderHabit(null);
  };

  return (
    <Card className="min-h-[200px] p-6 bg-leben-bg-card border border-leben-border-subtle">
      <View className="flex-row items-center justify-between mb-5">
        <Text className="text-leben-text font-semibold text-[15px]">
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
                    className="w-9 h-9 rounded-lg items-center justify-center border border-leben-border-subtle bg-leben-bg-secondary"
                  >
                    <Text style={{ color: h.color, fontSize: 18 }}>{h.icon}</Text>
                  </View>
                  <View className="gap-1">
                    <Text className="text-leben-text font-medium text-[13px]">{h.label}</Text>
                    <Text className="text-leben-text-dim text-[11px]">🔥 {h.streak} day streak</Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    onPress={() => setReminderHabit(reminderHabit === h.id ? null : h.id)}
                    className={`w-[26px] h-[26px] rounded-md items-center justify-center border ${
                      h.reminderAt ? 'bg-leben-accent/15 border-leben-accent' : 'bg-transparent border-transparent'
                    }`}
                  >
                    <Text className={h.reminderAt ? 'text-leben-accent' : 'text-leben-text-dim'}>🔔</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => toggleHabit(h.id)}
                    className="w-[42px] h-[26px] rounded-lg items-center justify-center border border-leben-border-subtle"
                    style={{
                      backgroundColor: h.checked ? h.color : 'transparent',
                    }}
                  >
                    <Text className={`text-xs ${h.checked ? 'text-white' : 'text-leben-text-muted'}`}>
                      {h.checked ? '✓' : '○'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {reminderHabit === h.id && (
                <View className="mt-3">
                  <ReminderPicker
                    initialValue={h.reminderAt ?? undefined}
                    onSave={(val) => handleSaveReminder(h.id, h.label, val)}
                    onClose={() => setReminderHabit(null)}
                  />
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
