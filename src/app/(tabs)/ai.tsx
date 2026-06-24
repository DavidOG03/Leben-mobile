import { View, Text } from 'react-native';
import { ScreenLayout } from '@/components/shared/ScreenLayout';
import { AIChatBox } from '@/components/ai/AIChatBox';

export default function AIScreen() {
  return (
    <ScreenLayout scrollable={false}>
      <View className="flex-row items-center justify-center py-4 border-b border-[#1a1a1a]">
        <View className="flex-row items-center gap-2">
          <Text className="text-[#7c6af0] text-lg">✦</Text>
          <Text className="text-white font-bold tracking-widest text-[11px] uppercase">
            Neural Engine
          </Text>
          <View className="px-1.5 py-0.5 rounded bg-[#1a1a1a] border border-[#222]">
            <Text className="text-[#888] font-bold text-[8px] uppercase">V1.0</Text>
          </View>
        </View>
      </View>
      
      <AIChatBox />
    </ScreenLayout>
  );
}
