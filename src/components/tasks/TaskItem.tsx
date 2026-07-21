import { useState } from 'react';
import { View, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useLebenStore } from '@/store/useStore';
import { scheduleReminder, cancelReminder } from '@/hooks/useNotifications';
import { LC } from '@/constants/theme';
import { Text } from '@/components/ui/Text';


interface TaskItemProps {
  taskId: string;
  isLast: boolean;
}

export function TaskItem({ taskId, isLast }: TaskItemProps) {
  const task = useLebenStore((s) => s.tasks.find((t) => t.id === taskId));
  const toggleTask = useLebenStore((s) => s.toggleTask);
  const removeTask = useLebenStore((s) => s.removeTask);
  const editTask = useLebenStore((s) => s.editTask);

  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [showReminder, setShowReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState('');

  if (!task) return null;

  const isWork = task.tag === 'WORK';

  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      editTask(taskId, { title: editTitle.trim() });
    }
    setIsEditing(false);
  };

  const handleSetReminder = async () => {
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

    await editTask(taskId, { reminderAt: reminderDate.toISOString() });
    await scheduleReminder({
      id: taskId,
      title: 'Task Reminder',
      body: task.title,
      date: reminderDate,
      screen: 'tasks',
    });

    setShowReminder(false);
    setReminderTime('');
  };

  const handleClearReminder = async () => {
    await editTask(taskId, { reminderAt: null });
    await cancelReminder(taskId);
    setShowReminder(false);
  };

  return (
    <View className={`border-leben-border-subtle ${!isLast ? 'border-b' : ''}`}>
      <View className="flex-row items-center gap-3 px-4 py-3.5 bg-transparent active:bg-white/[0.02]">
        {/* Checkbox */}
        <TouchableOpacity
          onPress={() => toggleTask(taskId)}
          className={`w-[18px] h-[18px] rounded-[5px] items-center justify-center border ${
            task.completed ? 'border-leben-success bg-leben-success/20' : 'border-leben-border-subtle bg-leben-bg-secondary'
          }`}
          activeOpacity={0.7}
        >
          {task.completed && <Text className="text-leben-success text-[10px]">✓</Text>}
        </TouchableOpacity>

        {/* Priority dot */}
        <View 
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{
            backgroundColor: task.priority === 'high' ? '#e85555' : task.priority === 'low' ? '#55e855' : '#e8a855',
            shadowColor: task.priority === 'high' ? '#e85555' : task.priority === 'low' ? '#55e855' : '#e8a855',
            shadowOpacity: 0.5,
            shadowRadius: 4,
            elevation: 2,
          }}
        />

        {/* Title */}
        <View className="flex-1 min-w-0 justify-center">
          {isEditing ? (
            <TextInput
              value={editTitle}
              onChangeText={setEditTitle}
              onBlur={handleSaveEdit}
              onSubmitEditing={handleSaveEdit}
              autoFocus
              className="text-leben-text-2 text-[13px] border-b border-leben-accent py-1"
              style={{ lineHeight: 18 }}
            />
          ) : (
            <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
              <Text 
                className={`text-[13px] leading-[18px] ${
                  task.completed ? 'text-leben-text-dim line-through' : 'text-leben-text-secondary'
                }`}
              >
                {task.title}
              </Text>
            </TouchableOpacity>
          )}

          {task.reminderAt && !isEditing && (
            <View className="flex-row items-center gap-1 mt-1">
              <Text className="text-leben-accent text-[10px]">🔔</Text>
              <Text className="text-leben-accent text-[10px]">
                {new Date(task.reminderAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          )}
        </View>

        {/* Actions Button */}
        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          className="w-7 h-7 items-center justify-center rounded-lg active:bg-white/5"
        >
          <Text className="text-leben-text-muted text-lg leading-none">⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Expanded Actions */}
      {isExpanded && (
        <View className="flex-row items-center gap-2 px-4 pb-3 border-t border-leben-border-subtle pt-3">
          <TouchableOpacity
            onPress={() => setShowReminder(!showReminder)}
            className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg border ${
              task.reminderAt ? 'bg-leben-accent/15 border-leben-accent' : 'bg-transparent border-leben-border-subtle'
            }`}
          >
            <Text className={task.reminderAt ? 'text-leben-accent' : 'text-leben-text-muted'}>🔔</Text>
            <Text className={`text-[11px] font-medium ${task.reminderAt ? 'text-leben-accent' : 'text-leben-text-muted'}`}>Reminder</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setEditTitle(task.title);
              setIsEditing(true);
              setIsExpanded(false);
            }}
            className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg border border-leben-border-subtle bg-transparent"
          >
            <Text className="text-leben-text-muted">✎</Text>
            <Text className="text-[11px] font-medium text-leben-text-muted">Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => removeTask(task.id)}
            className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[rgba(239,68,68,0.1)] bg-[rgba(239,68,68,0.05)]"
          >
            <Text className="text-leben-error opacity-80">🗑</Text>
            <Text className="text-[11px] font-medium text-leben-error opacity-80">Delete</Text>
          </TouchableOpacity>

          <View className="flex-1" />
          
          <View 
            className={`rounded px-2 py-1 border ${
              isWork ? 'bg-leben-accent/10 border-leben-accent/20' : 'bg-green-500/10 border-green-500/20'
            }`}
          >
            <Text 
              className={`text-[10px] font-semibold ${
                isWork ? 'text-leben-accent' : 'text-green-500'
              }`}
            >
              {task.tag}
            </Text>
          </View>
        </View>
      )}

      {/* Reminder Inline Form */}
      {showReminder && isExpanded && (
        <View className="px-4 pb-3 flex-row items-center gap-2">
          <TextInput
            value={reminderTime}
            onChangeText={setReminderTime}
            placeholderTextColor="gray"
            className="px-3 py-1.5 rounded bg-leben-bg border border-leben-border text-leben-text-2 text-xs w-20"
            maxLength={5}
          />
          <TouchableOpacity
            onPress={handleSetReminder}
            disabled={!reminderTime}
            className={`px-4 py-1.5 rounded border ${
              reminderTime ? 'bg-leben-accent border-leben-accent opacity-100' : 'bg-transparent border-leben-accent opacity-50'
            }`}
          >
            <Text className={reminderTime ? 'text-white text-xs' : 'text-leben-accent text-xs'}>Set</Text>
          </TouchableOpacity>
          {task.reminderAt && (
            <TouchableOpacity
              onPress={handleClearReminder}
              className="px-4 py-1.5 rounded border border-leben-border"
            >
              <Text className="text-leben-text-muted text-xs">Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
