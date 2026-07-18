import { View, } from 'react-native';
import { useLebenStore } from '@/store/useStore';
import { TaskItem } from './TaskItem';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';


export function TaskList() {
  const tasks = useLebenStore((s) => s.tasks);

  return (
    <Card className="p-0 overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
      {tasks.length === 0 ? (
        <View className="items-center justify-center py-10 gap-3 border-t border-leben-border-subtle">
          <Text className="text-leben-text-dim text-4xl">◎</Text>
          <Text className="text-leben-text-dim font-medium text-[13px]">No tasks yet</Text>
          <Text className="text-leben-text-dim text-[12px] text-center leading-relaxed">
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
