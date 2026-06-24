import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ScreenLayout } from '@/components/shared/ScreenLayout';
import { GoalList } from '@/components/goals/GoalList';
import { AddGoalSheet } from '@/components/goals/AddGoalSheet';

export default function GoalsScreen() {
  const [showAddSheet, setShowAddSheet] = useState(false);

  return (
    <ScreenLayout scrollable>
      <View className="flex-1 px-4 py-6">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-white font-bold text-3xl tracking-tight leading-tight mb-1">
              Goals
            </Text>
            <Text className="text-[#555] text-[13px]">
              Visualize and execute your long-term ambitions.
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowAddSheet(true)}
            className="w-10 h-10 rounded-full items-center justify-center bg-leben-accent active:opacity-80"
          >
            <Text className="text-white text-xl leading-none font-light">+</Text>
          </TouchableOpacity>
        </View>

        <GoalList />
      </View>

      <AddGoalSheet 
        visible={showAddSheet} 
        onClose={() => setShowAddSheet(false)} 
      />
    </ScreenLayout>
  );
}
