import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ message, fullScreen = false }: LoadingSpinnerProps) {
  return (
    <View className={`items-center justify-center ${fullScreen ? 'flex-1 bg-leben-bg' : 'p-4'}`}>
      <ActivityIndicator size="large" color="#7c6af0" />
      {message && (
        <Text className="text-leben-text-2 mt-4 text-sm font-medium">
          {message}
        </Text>
      )}
    </View>
  );
}
