import { View, Text } from 'react-native';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <View className={`items-center justify-center py-12 px-6 ${className}`}>
      <View className="w-16 h-16 rounded-full bg-leben-bg-secondary border border-leben-border items-center justify-center mb-5">
        <Text className="text-3xl">{icon}</Text>
      </View>
      
      <Text className="text-leben-text text-lg font-semibold mb-2 text-center">
        {title}
      </Text>
      
      <Text className="text-leben-text-2 text-sm text-center leading-relaxed mb-6">
        {description}
      </Text>
      
      {actionLabel && onAction && (
        <Button 
          label={actionLabel} 
          onPress={onAction} 
          variant="secondary"
        />
      )}
    </View>
  );
}
