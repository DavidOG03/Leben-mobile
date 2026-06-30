import { View, Text, ScrollView } from 'react-native';

export default function AIRightPanel() {
  return (
    <View
      className="hidden lg:flex h-full py-6"
      style={{
        width: 240,
        backgroundColor: '#0c0c0c',
        borderLeftWidth: 1,
        borderLeftColor: '#161616',
      }}
    >
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16 }}>
        {/* Today's Focus */}
        <View className="mb-6">
          <Text
            className="uppercase mb-4"
            style={{
              fontSize: 9,
              color: '#3a3a3a',
              letterSpacing: 1.4,
            }}
          >
            Today's Focus
          </Text>
          {/* Empty state or placeholders can go here */}
          <Text style={{ fontSize: 11, color: '#555' }}>
            No focus blocks scheduled yet.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
