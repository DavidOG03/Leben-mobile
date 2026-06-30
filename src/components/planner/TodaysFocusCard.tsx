import { View, Text } from 'react-native';

interface FocusItem {
  title: string;
  reason: string;
}

interface TodaysFocusCardProps {
  focusItems: FocusItem[];
}

export function TodaysFocusCard({ focusItems }: TodaysFocusCardProps) {
  return (
    <View
      className="rounded-2xl p-6 flex-col gap-5"
      style={{
        backgroundColor: '#111',
        borderColor: '#1e1e1e',
        borderWidth: 1,
      }}
    >
      <Text className="text-white font-semibold" style={{ fontSize: 14 }}>
        Today's Focus
      </Text>

      <View className="flex-col gap-4">
        {focusItems.length === 0 ? (
          <Text style={{ color: '#444', fontSize: 12 }}>
            No high-priority focus set.
          </Text>
        ) : (
          focusItems.map((item, i) => (
            <View key={i} className="flex-row gap-4 items-center">
              <View
                className="items-center justify-center font-bold"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: '#161616',
                  borderColor: '#222',
                  borderWidth: 1,
                }}
              >
                <Text style={{ color: '#555', fontSize: 12, fontWeight: 'bold' }}>
                  0{i + 1}
                </Text>
              </View>
              <View className="flex-col gap-1 flex-1">
                <Text
                  className="text-white font-medium"
                  style={{ fontSize: 13 }}
                >
                  {item.title}
                </Text>
                <Text
                  style={{
                    fontSize: 9,
                    color: '#666',
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                  }}
                >
                  {item.reason}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
}
