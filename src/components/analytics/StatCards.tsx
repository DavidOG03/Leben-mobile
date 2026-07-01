import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { StatCard } from '@/utils/analytics.utils';
import { Ionicons } from '@expo/vector-icons';

interface StatCardsProps {
  cards: StatCard[];
}

export default function StatCards({ cards }: StatCardsProps) {
  if (!cards || cards.length === 0) {
    return (
      <View className="flex-row gap-4 mb-6 opacity-50">
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            className="rounded-2xl p-5 w-[160px]"
            style={{ backgroundColor: '#111', borderColor: '#1e1e1e', borderWidth: 1 }}
          >
            <View className="w-16 h-3 rounded bg-white/5 mb-3" />
            <View className="w-20 h-8 rounded bg-white/5 mb-3" />
            <View className="w-12 h-3 rounded bg-white/5" />
          </View>
        ))}
      </View>
    );
  }

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      className="mb-6"
      contentContainerStyle={{ gap: 16, paddingRight: 16 }}
    >
      {cards.map((s) => (
        <View
          key={s.label}
          className="rounded-2xl p-5 w-[160px]"
          style={{ backgroundColor: '#111', borderColor: '#1e1e1e', borderWidth: 1 }}
        >
          <Text style={{ fontSize: 11, color: '#555', marginBottom: 8 }}>
            {s.label}
          </Text>
          <Text
            className="font-black text-white"
            style={{ fontSize: 28, letterSpacing: -0.5, lineHeight: 28 }}
          >
            {s.val}
          </Text>
          <View className="flex-row items-center gap-1 mt-2">
            {s.up !== null && (
              <Ionicons 
                name={s.up ? "arrow-up" : "arrow-down"} 
                size={10} 
                color={s.up ? "#4caf7d" : "#e85555"} 
              />
            )}
            <Text
              style={{
                fontSize: 11,
                color:
                  s.up === true
                    ? '#4caf7d'
                    : s.up === false
                    ? '#e85555'
                    : '#555',
              }}
            >
              {s.sub}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
