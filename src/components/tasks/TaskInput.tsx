import { useState } from 'react';
import { View, TextInput, TouchableOpacity, } from 'react-native';
import { useLebenStore } from '@/store/useStore';
import { Card } from '@/components/ui/Card';
import ReminderPicker from '@/components/shared/ReminderPicker';
import { Text } from '@/components/ui/Text';


export function TaskInput() {
  const [task, setTask] = useState('');
  const [tag, setTag] = useState<'WORK' | 'PERSONAL'>('WORK');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [showReminder, setShowReminder] = useState(false);
  const [reminderAt, setReminderAt] = useState<string | undefined>();

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
      reminderAt: reminderAt,
    });
    setTask('');
    setReminderAt(undefined);
  };

  return (
    <Card className="p-4 mb-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
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

      <View className="flex-row flex-wrap items-center justify-between gap-4 border-t border-leben-border pt-4 mt-2">
        <View className="flex-row items-center gap-2">
          {/* Tag Selector */}
          <View className="flex-row items-center gap-1.5 p-1 rounded-lg border border-leben-border bg-leben-bg">
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
                  style={{ color: tag === t ? (t === 'WORK' ? '#4a7abf' : '#8a5abf') : 'var(--text-dim)' }}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity onPress={() => setShowReminder(true)} className="flex-row items-center gap-1 p-1.5 bg-leben-bg rounded-lg border border-leben-border">
            <Text className="text-leben-text-muted text-[10px]">{reminderAt ? new Date(reminderAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "🔔"}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleAddTask}
          disabled={!task.trim()}
          className="flex-row items-center justify-center gap-2 px-4 py-2 rounded-xl"
          style={{
            backgroundColor: task.trim() ? '#25256e' : 'var(--bg-secondary)',
            borderColor: task.trim() ? '#3a3a9e' : 'var(--border-primary)',
            borderWidth: 1,
            opacity: task.trim() ? 1 : 0.8,
          }}
        >
          <Text className="font-semibold text-[12px]" style={{ color: task.trim() ? 'var(--accent-blue-light)' : 'var(--text-dim)' }}>
            Add Task
          </Text>
          <Text style={{ color: task.trim() ? 'var(--accent-blue-light)' : 'var(--text-dim)' }}>+</Text>
        </TouchableOpacity>
      </View>

      {showReminder && (
        <View style={{ position: 'absolute', bottom: -100, left: 0, right: 0, zIndex: 50 }}>
          <ReminderPicker
            initialValue={reminderAt}
            onSave={(val) => { setReminderAt(val); setShowReminder(false); }}
            onClose={() => setShowReminder(false)}
          />
        </View>
      )}
    </Card>
  );
}
