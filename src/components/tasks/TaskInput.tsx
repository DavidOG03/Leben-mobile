import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { useLebenStore } from '@/store/useStore';
import { Card } from '@/components/ui/Card';

export function TaskInput() {
  const [task, setTask] = useState('');
  const [tag, setTag] = useState<'WORK' | 'PERSONAL'>('WORK');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');

  const addTask = useLebenStore((s) => s.addTask);

  const handleAddTask = () => {
    const trimmed = task.trim();
    if (!trimmed) return;
    addTask({
      id: Math.random().toString(36).substring(7),
      title: trimmed,
      completed: false,
      tag: tag,
      priority: priority,
      date: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
    });
    setTask('');
  };

  return (
    <Card className="p-4 mb-6" style={{ backgroundColor: '#141414', borderColor: '#1e1e1e' }}>
      <View className="flex-row items-center mb-4">
        <TextInput
          value={task}
          onChangeText={setTask}
          onSubmitEditing={handleAddTask}
          placeholder="What needs to be done?"
          placeholderTextColor="#666"
          className="flex-1 px-4 py-3 rounded-xl text-white text-[15px]"
        />
      </View>

      <View className="flex-row flex-wrap items-center justify-between gap-4 border-t border-[#1e1e1e] pt-4 mt-2">
        {/* Tag Selector */}
        <View className="flex-row items-center gap-1.5 p-1 rounded-lg border border-[#1e1e1e]" style={{ backgroundColor: '#0a0a0a' }}>
          {(['WORK', 'PERSONAL'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTag(t)}
              className="px-2 py-1 rounded-md"
              style={{
                backgroundColor: tag === t ? (t === 'WORK' ? '#1a1f2e' : '#1e1a2a') : 'transparent',
              }}
            >
              <Text 
                className="text-[10px] uppercase font-bold tracking-wider"
                style={{ color: tag === t ? (t === 'WORK' ? '#4a7abf' : '#8a5abf') : '#444' }}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={handleAddTask}
          disabled={!task.trim()}
          className="flex-row items-center justify-center gap-2 px-4 py-2 rounded-xl"
          style={{
            backgroundColor: task.trim() ? '#25256e' : '#1a1a1a',
            borderColor: task.trim() ? '#3a3a9e' : '#222',
            borderWidth: 1,
            opacity: task.trim() ? 1 : 0.8,
          }}
        >
          <Text className="font-semibold text-[12px]" style={{ color: task.trim() ? '#9d8ff5' : '#444' }}>
            Add Task
          </Text>
          <Text style={{ color: task.trim() ? '#9d8ff5' : '#444' }}>+</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}
