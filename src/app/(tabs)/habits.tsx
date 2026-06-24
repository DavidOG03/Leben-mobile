import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ScreenLayout } from '@/components/shared/ScreenLayout';
import { HabitList } from '@/components/habits/HabitList';
import { AddHabitSheet } from '@/components/habits/AddHabitSheet';

export default function HabitsScreen() {
  const [showAddSheet, setShowAddSheet] = useState(false);

  return (
    <ScreenLayout scrollable>
      <View className="flex-1 px-4 py-6">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-white font-bold text-3xl tracking-tight leading-tight mb-1">
              Habits & Rituals
            </Text>
            <Text className="text-[#555] text-[13px]">
              Small consistent actions compound.
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowAddSheet(true)}
            className="w-10 h-10 rounded-full items-center justify-center bg-leben-accent active:opacity-80"
          >
            <Text className="text-white text-xl leading-none font-light">+</Text>
          </TouchableOpacity>
        </View>

        <HabitList />
      </View>

      <AddHabitSheet 
        visible={showAddSheet} 
        onClose={() => setShowAddSheet(false)} 
      />
    </ScreenLayout>
  );
}
