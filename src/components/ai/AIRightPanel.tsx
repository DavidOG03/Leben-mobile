import { View, ScrollView } from 'react-native';
import { Text } from '@/components/ui/Text';


export default function AIRightPanel() {
  return (
    <View
      className="hidden lg:flex h-full py-6 w-[240px] bg-leben-bg border-l border-leben-bg-card"
    >
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16 }}>
        {/* Today's Focus */}
        <View className="mb-6">
          <Text className="uppercase mb-4 text-[9px] text-leben-text-dim tracking-[1.4px]">
            Today's Focus
          </Text>
          {/* Empty state or placeholders can go here */}
          <Text className="text-[11px] text-leben-text-muted">
            No focus blocks scheduled yet.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
