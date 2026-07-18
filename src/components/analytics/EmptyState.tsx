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
    <View className="flex-col items-center justify-center py-6 gap-2" style={{ minHeight: 80 }}>
      {typeof icon === 'string' ? (
        <Text style={{ fontSize: 22, opacity: 0.4 }}>{icon}</Text>
      ) : (
        <View style={{ opacity: 0.4 }}>{icon}</View>
      )}
      <Text className="text-leben-text-dim font-medium" style={{ fontSize: 12 }}>
        {message}
      </Text>
      <Text
        className="text-center text-leben-text-dim"
        style={{ fontSize: 10, maxWidth: 160, lineHeight: 15 }}
      >
        {hint}
      </Text>
    </View>
  );
}
