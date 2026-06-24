import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useLebenStore } from '@/store/useStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { scheduleReminder, cancelReminder } from '@/hooks/useNotifications';

function truncateWords(text: string, maxWords = 4) {
  const words = text.trim().split(/\s+/);
  return words.length > maxWords ? `${words.slice(0, maxWords).join(' ')}…` : text;
}

export function TodaysFocus() {
  const router = useRouter();
  const tasks = useLebenStore((s) => s.tasks);
  const toggleTask = useLebenStore((s) => s.toggleTask);
  const deleteTask = useLebenStore((s) => s.removeTask); // NOTE: mapped to removeTask in zustand
  const updateTask = useLebenStore((s) => s.editTask);   // NOTE: mapped to editTask in zustand
  const [reminderTask, setReminderTask] = useState<string | null>(null);
  const [reminderTime, setReminderTime] = useState<string>('');

  const handleToggleTask = (taskId: string) => toggleTask(taskId);

  const handleSetReminder = async (taskId: string, taskTitle: string) => {
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
      reminderDate.setDate(reminderDate.getDate() + 1); // tomorrow if past
    }

    await updateTask(taskId, { reminderAt: reminderDate.toISOString() });
    await scheduleReminder({
      id: taskId,
      title: 'Task Reminder',
      body: taskTitle,
      date: reminderDate,
      screen: 'tasks',
    });

    setReminderTask(null);
    setReminderTime('');
  };

  const handleClearReminder = async (taskId: string) => {
    await updateTask(taskId, { reminderAt: null });
    await cancelReminder(taskId);
    setReminderTask(null);
  };

  return (
    <Card className="min-h-[200px] p-0 overflow-hidden" style={{ backgroundColor: '#121212', borderColor: '#1e1e1e' }}>
      {/* Header */}
      <View className="flex-row items-center justify-between p-6 pb-4">
        <Text className="text-white font-semibold text-[15px]">
          Today's Focus
        </Text>
        {tasks.length > 0 && (
          <TouchableOpacity onPress={() => router.push('/(tabs)/tasks' as any)}>
            <Text className="text-leben-accent text-[11px] font-semibold">
              Go to Tasks
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {tasks.length === 0 ? (
        <View className="flex-1 items-center justify-center py-6 gap-3">
          <Text className="text-[#333] text-2xl">十</Text>
          <Text className="text-[#333] text-xs text-center leading-relaxed">
            No tasks yet
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/tasks' as any)}
            className="px-4 py-1.5 rounded-lg border border-[#222] active:opacity-70"
          >
            <Text className="text-[#666] text-[11px]">Add your first task</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          {tasks.map((task, i) => {
            const isLast = i === tasks.length - 1;
            const isWork = task.tag === 'WORK';
            
            return (
              <View key={task.id}>
                <View 
                  className={`flex-row items-center gap-3 px-5 py-4 ${!isLast ? 'border-b border-[#181818]' : ''}`}
                >
                  {/* Checkbox */}
                  <TouchableOpacity
                    onPress={() => handleToggleTask(task.id)}
                    className="w-[18px] h-[18px] rounded-[5px] items-center justify-center"
                    style={{
                      borderWidth: 1,
                      borderColor: task.completed ? '#3a7a4a' : '#2a2a2a',
                      backgroundColor: task.completed ? '#1e3d26' : '#1a1a1a',
                    }}
                    activeOpacity={0.7}
                  >
                    {task.completed && <Text className="text-[#4caf70] text-[10px]">✓</Text>}
                  </TouchableOpacity>

                  {/* Title */}
                  <Text
                    className="flex-1 text-[13px] leading-snug"
                    style={{
                      color: task.completed ? '#444' : '#ccc',
                      textDecorationLine: task.completed ? 'line-through' : 'none',
                    }}
                    numberOfLines={1}
                  >
                    {truncateWords(task.title, 4)}
                  </Text>

                  {/* Right side: Tag + Date */}
                  <View className="items-end gap-1.5">
                    {task.tag && (
                      <View 
                        className="rounded px-2 py-0.5"
                        style={{
                          backgroundColor: isWork ? '#1a1f2e' : '#1e1a2a',
                          borderColor: isWork ? '#1e2a42' : '#2a1e42',
                          borderWidth: 1,
                        }}
                      >
                        <Text 
                          style={{ color: isWork ? '#4a7abf' : '#8a5abf' }} 
                          className="text-[9px] font-medium tracking-widest"
                        >
                          {task.tag}
                        </Text>
                      </View>
                    )}
                    {task.date && (
                      <Text className="text-[10px] text-[#333]">
                        {task.date}
                      </Text>
                    )}
                  </View>

                  {/* Reminder Toggle */}
                  <TouchableOpacity
                    onPress={() => setReminderTask(reminderTask === task.id ? null : task.id)}
                    className="w-7 h-7 rounded-md items-center justify-center ml-1"
                    style={{
                      backgroundColor: task.reminderAt ? 'rgba(124, 106, 240, 0.15)' : 'transparent',
                      borderColor: task.reminderAt ? '#7c6af0' : 'transparent',
                      borderWidth: 1,
                    }}
                  >
                    <Text className={task.reminderAt ? 'text-leben-accent' : 'text-[#444]'}>
                      🔔
                    </Text>
                  </TouchableOpacity>

                  {/* Delete (always visible on mobile vs hover on web) */}
                  <TouchableOpacity
                    onPress={() => deleteTask(task.id)}
                    className="w-7 h-7 items-center justify-center"
                  >
                    <Text className="text-[#444] text-xs">🗑️</Text>
                  </TouchableOpacity>
                </View>

                {/* Reminder Picker Inline */}
                {reminderTask === task.id && (
                  <View className="px-5 py-3 flex-row items-center gap-2 bg-white/5 border-t border-white/5">
                    <TextInput
                      value={reminderTime}
                      onChangeText={setReminderTime}
                      placeholder="HH:MM"
                      placeholderTextColor="#555"
                      keyboardType="numbers-and-punctuation"
                      className="px-3 py-1.5 rounded bg-leben-bg border border-[#333] text-[#ccc] text-xs w-20"
                      maxLength={5}
                    />
                    <TouchableOpacity
                      onPress={() => handleSetReminder(task.id, task.title)}
                      disabled={!reminderTime}
                      className="px-4 py-1.5 rounded"
                      style={{
                        backgroundColor: reminderTime ? '#7c6af0' : 'transparent',
                        borderColor: '#7c6af0',
                        borderWidth: 1,
                        opacity: reminderTime ? 1 : 0.5,
                      }}
                    >
                      <Text className="text-white text-xs">Set</Text>
                    </TouchableOpacity>
                    {task.reminderAt && (
                      <TouchableOpacity
                        onPress={() => handleClearReminder(task.id)}
                        className="px-4 py-1.5 rounded border border-[#555]"
                      >
                        <Text className="text-[#999] text-xs">Clear</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </Card>
  );
}
