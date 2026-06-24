import { View } from 'react-native';
import { ScreenLayout } from '@/components/shared/ScreenLayout';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { AIMorningBrief } from '@/components/dashboard/AIMorningBrief';
import { EfficiencyScore } from '@/components/dashboard/EfficiencyScore';
import { TodaysFocus } from '@/components/dashboard/TodaysFocus';
import { HabitStreaks } from '@/components/dashboard/HabitStreaks';
import { GoalProgress } from '@/components/dashboard/GoalProgress';

export default function DashboardScreen() {
  return (
    <ScreenLayout scrollable>
      <DashboardHeader />
      
      <View className="flex-1 px-4 py-5 gap-5">
        {/* Top Section */}
        <AIMorningBrief />
        <EfficiencyScore />

        {/* Bottom Section */}
        <TodaysFocus />
        <HabitStreaks />
        <GoalProgress />
      </View>
    </ScreenLayout>
  );
}
