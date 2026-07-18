import { View, } from 'react-native';
import { ScreenLayout } from '@/components/shared/ScreenLayout';
import AIChatBox from '@/components/ai/AIChatBox';
import { Text } from '@/components/ui/Text';


export default function AIScreen() {
  return (
    <ScreenLayout scrollable={false}>
      <View className="flex-row items-center justify-center py-4 border-b border-leben-border-subtle">
        <View className="flex-row items-center gap-2">
          <Text className="text-leben-accent text-lg">✦</Text>
          <Text className="text-white font-bold tracking-widest text-[11px] uppercase">
            Neural Engine
          </Text>
          <View className="px-1.5 py-0.5 rounded bg-leben-bg-secondary border border-leben-border">
            <Text className="text-leben-text-muted font-bold text-[8px] uppercase">V1.0</Text>
          </View>
        </View>
      </View>
      
      <AIChatBox />
    </ScreenLayout>
  );
}
