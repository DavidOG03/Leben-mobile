import { View, ActivityIndicator } from 'react-native';

export default function AuthCallbackScreen() {
  return (
    <View className="flex-1 bg-leben-bg items-center justify-center">
      <ActivityIndicator size="large" color="#7c6af0" />
    </View>
  );
}
