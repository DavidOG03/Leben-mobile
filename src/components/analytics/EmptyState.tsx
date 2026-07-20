import React from 'react';
import { View, } from 'react-native';
import { Text } from '@/components/ui/Text';


interface EmptyStateProps {
  icon: string | React.ReactNode;
  message: string;
  hint: string;
}

export default function EmptyState({ icon, message, hint }: EmptyStateProps) {
  return (
    <View className="flex-col items-center justify-center py-6 gap-2 min-h-[80px]">
      {typeof icon === 'string' ? (
        <Text className="text-[22px] opacity-40">{icon}</Text>
      ) : (
        <View className="opacity-40">{icon}</View>
      )}
      <Text className="text-leben-text-dim font-medium text-[12px]">
        {message}
      </Text>
      <Text className="text-center text-leben-text-dim text-[10px] max-w-[160px] leading-[15px]">
        {hint}
      </Text>
    </View>
  );
}
