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
    <Card className="p-4 mb-6 bg-leben-bg-card border border-leben-border-subtle">
      <View className="flex-row items-center mb-4">
        <TextInput
          value={task}
          onChangeText={setTask}
          onSubmitEditing={handleAddTask}
          placeholder="What needs to be done?"
          placeholderTextColor="var(--text-muted)"
          className="flex-1 px-4 py-3 rounded-xl text-leben-text text-[15px]"
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
                className={`px-2 py-1 rounded-md border ${
                  tag === t 
                    ? (t === 'WORK' ? 'bg-leben-accent/10 border-leben-accent/20' : 'bg-green-500/10 border-green-500/20')
                    : 'bg-transparent border-transparent'
                }`}
              >
                <Text 
                  className={`text-[10px] uppercase font-bold tracking-wider ${
                    tag === t ? (t === 'WORK' ? 'text-leben-accent' : 'text-green-500') : 'text-leben-text-dim'
                  }`}
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
          className={`flex-row items-center justify-center gap-2 px-4 py-2 rounded-xl border ${
            task.trim() ? 'bg-leben-accent border-leben-accent opacity-100' : 'bg-transparent border-leben-border opacity-50'
          }`}
        >
          <Text className={`font-semibold text-[12px] ${task.trim() ? 'text-white' : 'text-leben-text-dim'}`}>
            Add Task
          </Text>
          <Text className={task.trim() ? 'text-white' : 'text-leben-text-dim'}>+</Text>
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
