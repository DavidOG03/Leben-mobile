import React from 'react';
import { View, Text } from 'react-native';

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
      <Text className="text-[#444] font-medium" style={{ fontSize: 12 }}>
        {message}
      </Text>
      <Text
        className="text-center text-[#333]"
        style={{ fontSize: 10, maxWidth: 160, lineHeight: 15 }}
      >
        {hint}
      </Text>
    </View>
  );
}
