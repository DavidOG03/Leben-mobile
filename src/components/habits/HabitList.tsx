import { View, Text } from 'react-native';
import { useLebenStore } from '@/store/useStore';
import { HabitItem } from './HabitItem';

export function HabitList() {
  const habits = useLebenStore((s) => s.habits);

  if (habits.length === 0) {
    return (
      <View
        style={{
          borderRadius: 16,
          borderWidth: 1,
          borderColor: '#1e1e1e',
          backgroundColor: '#131313',
          overflow: 'hidden',
        }}
      >
        {/* Ghost preview rows */}
        <View style={{ flexDirection: 'row', gap: 12, padding: 16 }}>
          {[1, 0.65, 0.35].map((op, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 80,
                borderRadius: 12,
                backgroundColor: `rgba(255,255,255,${op * 0.03})`,
                borderWidth: 1,
                borderColor: `rgba(255,255,255,${op * 0.04})`,
              }}
            />
          ))}
        </View>

        {/* Empty state */}
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 32,
            gap: 8,
            borderTopWidth: 1,
            borderTopColor: '#181818',
          }}
        >
          <Text style={{ fontSize: 28 }}>🌱</Text>
          <Text style={{ fontSize: 13, color: '#888', fontWeight: '500' }}>
            No habits yet
          </Text>
          <Text style={{ fontSize: 12, color: '#666', textAlign: 'center', lineHeight: 20 }}>
            Tap the + button above{'\n'}to build your first ritual.
          </Text>
        </View>
      </View>
    );
  }

  // Two-column grid layout matching the web
  const rows: typeof habits[] = [];
  for (let i = 0; i < habits.length; i += 2) {
    rows.push(habits.slice(i, i + 2));
  }

  return (
    <View style={{ gap: 12 }}>
      {rows.map((row, rowIdx) => (
        <View key={rowIdx} style={{ flexDirection: 'row', gap: 12 }}>
          {row.map((habit) => (
            <View key={habit.id} style={{ flex: 1 }}>
              <HabitItem habit={habit} />
            </View>
          ))}
          {/* Fill empty cell if odd number of habits */}
          {row.length === 1 && <View style={{ flex: 1 }} />}
        </View>
      ))}
    </View>
  );
}
