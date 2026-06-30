import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { AIIcon, PlusIcon } from '@/constants/Icons';

export function EmptyPlannerState({ taskCount }: { taskCount: number }) {
  const router = useRouter();
  const remaining = 2 - taskCount;

  return (
    <View
      className="flex-col items-center justify-center py-20 px-6 rounded-3xl"
      style={{
        backgroundColor: '#0a0a0a',
        borderColor: '#222',
        borderWidth: 1,
        borderStyle: 'dashed',
      }}
    >
      <View
        className="mb-8 p-6 rounded-full items-center justify-center"
        style={{
          backgroundColor: 'rgba(124, 106, 240, 0.1)',
        }}
      >
        <View
          className="items-center justify-center rounded-2xl"
          style={{
            width: 64,
            height: 64,
            backgroundColor: '#16161a',
            borderColor: '#252525',
            borderWidth: 1,
          }}
        >
          <AIIcon color="#7c6af0" size={24} />
        </View>
      </View>

      <Text
        className="text-white font-bold mb-3 text-center"
        style={{ fontSize: 24, letterSpacing: -0.5 }}
      >
        System Idle
      </Text>
      <Text
        className="text-[#666] mb-10 text-center"
        style={{ fontSize: 14, lineHeight: 22, maxWidth: 300 }}
      >
        The AI Planner requires more contextual input to generate an optimized daily plan. Add{' '}
        <Text style={{ color: '#7c6af0', fontWeight: 'bold' }}>
          {remaining} more {remaining === 1 ? 'task' : 'tasks'}
        </Text>{' '}
        to activate high-performance scheduling.
      </Text>

      <View className="flex-col gap-4 w-full" style={{ maxWidth: 240 }}>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/tasks' as any)}
          className="flex-row items-center justify-center gap-2 px-6 py-3 rounded-xl"
          style={{
            backgroundColor: '#7c6af0',
            shadowColor: '#7c6af0',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.4,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          <PlusIcon color="#fff" size={16} />
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>Add Tasks</Text>
        </TouchableOpacity>

        <Text
          className="text-center"
          style={{
            color: '#444',
            fontSize: 11,
            fontWeight: '600',
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}
        >
          Current tasks: {taskCount} / 3
        </Text>
      </View>
    </View>
  );
}
