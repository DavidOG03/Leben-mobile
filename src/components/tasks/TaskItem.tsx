import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useLebenStore } from '@/store/useStore';
import { scheduleReminder, cancelReminder } from '@/hooks/useNotifications';
import { LC } from '@/constants/theme';

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
    <View className={`border-[#181818] ${!isLast ? 'border-b' : ''}`}>
      <View className="flex-row items-center gap-3 px-4 py-3.5 bg-transparent active:bg-white/[0.02]">
        {/* Checkbox */}
        <TouchableOpacity
          onPress={() => toggleTask(taskId)}
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
              className="text-[#ccc] text-[13px] border-b border-[#3a3a9e] py-1"
              style={{ lineHeight: 18 }}
            />
          ) : (
            <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
              <Text 
                className="text-[13px]"
                style={{
                  color: task.completed ? '#444' : '#ccc',
                  textDecorationLine: task.completed ? 'line-through' : 'none',
                  lineHeight: 18,
                }}
              >
                {task.title}
              </Text>
            </TouchableOpacity>
          )}

          {task.reminderAt && !isEditing && (
            <View className="flex-row items-center gap-1 mt-1">
              <Text className="text-[#7c6af0] text-[10px]">🔔</Text>
              <Text className="text-[#7c6af0] text-[10px]">
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
          <Text className="text-[#555] text-lg leading-none">⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Expanded Actions */}
      {isExpanded && (
        <View className="flex-row items-center gap-2 px-4 pb-3 border-t border-[#1a1a1a] pt-3">
          <TouchableOpacity
            onPress={() => setShowReminder(!showReminder)}
            className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#222] bg-white/[0.04]"
            style={task.reminderAt ? { backgroundColor: 'rgba(124,106,240,0.15)', borderColor: 'rgba(124,106,240,0.2)' } : {}}
          >
            <Text className={task.reminderAt ? 'text-[#7c6af0]' : 'text-[#666]'}>🔔</Text>
            <Text className={`text-[11px] font-medium ${task.reminderAt ? 'text-[#7c6af0]' : 'text-[#666]'}`}>Reminder</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setEditTitle(task.title);
              setIsEditing(true);
              setIsExpanded(false);
            }}
            className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#222] bg-white/[0.04]"
          >
            <Text className="text-[#666]">✎</Text>
            <Text className="text-[11px] font-medium text-[#666]">Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => removeTask(task.id)}
            className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[rgba(239,68,68,0.1)] bg-[rgba(239,68,68,0.05)]"
          >
            <Text className="text-[#ef4444] opacity-80">🗑</Text>
            <Text className="text-[11px] font-medium text-[#ef4444] opacity-80">Delete</Text>
          </TouchableOpacity>

          <View className="flex-1" />
          
          <View 
            className="rounded px-2 py-1"
            style={{
              backgroundColor: isWork ? '#1a1f2e' : '#1e1a2a',
              borderColor: isWork ? '#1e2a42' : '#2a1e42',
              borderWidth: 1,
            }}
          >
            <Text 
              style={{ color: isWork ? '#4a7abf' : '#8a5abf' }} 
              className="text-[10px] font-semibold"
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
            placeholder="HH:MM"
            placeholderTextColor="#555"
            keyboardType="numbers-and-punctuation"
            className="px-3 py-1.5 rounded bg-leben-bg border border-[#333] text-[#ccc] text-xs w-20"
            maxLength={5}
          />
          <TouchableOpacity
            onPress={handleSetReminder}
            disabled={!reminderTime}
            className="px-4 py-1.5 rounded border border-[#7c6af0]"
            style={{ backgroundColor: reminderTime ? '#7c6af0' : 'transparent', opacity: reminderTime ? 1 : 0.5 }}
          >
            <Text className="text-white text-xs">Set</Text>
          </TouchableOpacity>
          {task.reminderAt && (
            <TouchableOpacity
              onPress={handleClearReminder}
              className="px-4 py-1.5 rounded border border-[#555]"
            >
              <Text className="text-[#999] text-xs">Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
