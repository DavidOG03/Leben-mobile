import { View, Text } from 'react-native';
import { useLebenStore } from '@/store/useStore';
import { TaskItem } from './TaskItem';
import { Card } from '@/components/ui/Card';

export function TaskList() {
  const tasks = useLebenStore((s) => s.tasks);

  return (
    <Card className="p-0 overflow-hidden" style={{ backgroundColor: '#131313', borderColor: '#1e1e1e' }}>
      {tasks.length === 0 ? (
        <View className="items-center justify-center py-10 gap-3 border-t border-[#181818]">
          <Text className="text-[#333] text-4xl">◎</Text>
          <Text className="text-[#333] font-medium text-[13px]">No tasks yet</Text>
          <Text className="text-[#2a2a2a] text-[12px] text-center leading-relaxed">
            Type above to add your first task{'\n'}and start building momentum.
          </Text>
        </View>
      ) : (
        <View>
          {tasks.map((task, i) => (
            <TaskItem 
              key={task.id} 
              taskId={task.id} 
              isLast={i === tasks.length - 1} 
            />
          ))}
        </View>
      )}
    </Card>
  );
}
