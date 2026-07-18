import { useState } from 'react';
import { View, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useLebenStore, Habit } from '@/store/useStore';
import { calcStreak } from '@/utils/habits';
import { Text } from '@/components/ui/Text';


interface HabitItemProps {
  habit: Habit;
}

export function HabitItem({ habit }: HabitItemProps) {
  const toggleHabit = useLebenStore((s) => s.toggleHabit);
  const deleteHabit = useLebenStore((s) => s.deleteHabit);
  const editHabit   = useLebenStore((s) => s.editHabit);

  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(habit.label);
  const [editSub,   setEditSub]   = useState(habit.sub);

  // Always derive checked state from completedDates (never stale)
  const todayStr      = new Date().toISOString().slice(0, 10);
  const isCheckedToday = (habit.completedDates ?? []).includes(todayStr);

  // Recalculate streak live from completedDates
  const currentStreak = calcStreak(habit.completedDates ?? []);

  const handleSave = () => {
    editHabit(habit.id, { label: editLabel, sub: editSub });
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habit.label}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteHabit(habit.id) },
      ],
    );
  };

  return (
    <View
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: isCheckedToday ? `${habit.color}55` : 'var(--border-primary)',
      }}
    >
      {/* Top row: icon + actions */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        {/* Icon */}
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: `${habit.color}18`,
            borderWidth: 1,
            borderColor: `${habit.color}22`,
          }}
        >
          <Text style={{ fontSize: 20 }}>{habit.icon}</Text>
        </View>

        {/* Edit / Delete */}
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <TouchableOpacity
            onPress={() => {
              setEditLabel(habit.label);
              setEditSub(habit.sub);
              setIsEditing(true);
            }}
            style={{ padding: 6 }}
          >
            <Text style={{ fontSize: 13 }}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={{ padding: 6 }}>
            <Text style={{ fontSize: 13 }}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Edit form or label display */}
      {isEditing ? (
        <View style={{ gap: 8, marginBottom: 16 }}>
          <TextInput
            autoFocus
            value={editLabel}
            onChangeText={setEditLabel}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderWidth: 1,
              borderColor: 'var(--border-primary)',
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 6,
              color: 'var(--text-primary)',
              fontSize: 14,
            }}
            placeholder="Habit Label"
            placeholderTextColor="#555"
          />
          <TextInput
            value={editSub}
            onChangeText={setEditSub}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderWidth: 1,
              borderColor: 'var(--border-primary)',
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 6,
              color: 'var(--text-primary)',
              fontSize: 11,
            }}
            placeholder="Subtext"
            placeholderTextColor="#555"
          />
          <TouchableOpacity
            onPress={handleSave}
            style={{
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 6,
              backgroundColor: habit.color,
              alignItems: 'center',
              marginTop: 4,
            }}
          >
            <Text style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: 12 }}>Save</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={{ fontSize: 15, fontWeight: '700', color: 'var(--text-primary)', marginBottom: 2 }}>
            {habit.label}
          </Text>
          <Text style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>
            {habit.sub}
          </Text>
        </>
      )}

      {/* Best streak */}
      <Text style={{ fontSize: 10, color: '#777', marginBottom: 14 }}>
        Best: {habit.longestStreak}d
      </Text>

      {/* Bottom row: done status + toggle */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 10, color: isCheckedToday ? habit.color : 'var(--text-secondary)' }}>
          {isCheckedToday ? `Done today ✓  🔥${currentStreak}` : `Not yet  🔥${currentStreak}`}
        </Text>

        <TouchableOpacity
          onPress={() => toggleHabit(habit.id)}
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isCheckedToday ? `${habit.color}22` : 'transparent',
            borderWidth: 1.5,
            borderColor: isCheckedToday ? habit.color : 'var(--border-primary)',
          }}
          activeOpacity={0.7}
        >
          {isCheckedToday && (
            <Text style={{ color: habit.color, fontSize: 12, fontWeight: '700' }}>✓</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
