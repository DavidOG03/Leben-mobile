import { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ScreenLayout } from '@/components/shared/ScreenLayout';
import { useLebenStore } from '@/store/useStore';
import { buildAnalyticsData } from '@/utils/analytics.utils';
import StatCards from '@/components/analytics/StatCards';
import WeeklyActivityChart from '@/components/analytics/WeeklyActivityChart';
import { ProductivityScore } from '@/components/analytics/ProductivityScore';
import HabitBreakdown from '@/components/analytics/HabitBreakdown';
import GoalBreakdown from '@/components/analytics/GoalBreakdown';
import AIInsights from '@/components/analytics/AIInsights';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AnalyticsScreen() {
  const router = useRouter();
  
  // You would typically have a way to check if the user is authenticated in the store.
  // Assuming `userId` or similar exists. For now, checking if `userId` exists.
  const userId = useLebenStore((s: any) => s.userId);
  
  const tasks = useLebenStore((s) => s.tasks);
  const habits = useLebenStore((s) => s.habits);
  const goals = useLebenStore((s) => s.goals);

  const analytics = useMemo(() => buildAnalyticsData(tasks, habits, goals), [tasks, habits, goals]);

  return (
    <ScreenLayout scrollable>
      <View className="flex-1 px-4 py-6">
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-white font-bold text-3xl tracking-tight leading-tight mb-1">
              Analytics
            </Text>
            <Text className="text-[#555] text-[13px]">
              Data-driven insights on your performance.
            </Text>
          </View>
        </View>

        {!userId ? (
          /* Analytics Lock Screen */
          <View className="flex-1 items-center justify-center pt-10 pb-20 px-4">
            <View
              className="items-center justify-center rounded-2xl mb-7"
              style={{
                width: 70,
                height: 70,
                backgroundColor: 'rgba(124,106,240,0.05)',
                borderColor: 'rgba(124,106,240,0.1)',
                borderWidth: 1,
              }}
            >
              <Ionicons name="stats-chart" size={28} color="#7c6af0" />
            </View>

            <View className="items-center space-y-3 mb-8">
              <Text
                className="text-white font-bold text-center"
                style={{ fontSize: 28, letterSpacing: -0.5 }}
              >
                Deep Performance <Text style={{ color: '#7c6af0' }}>Metrics.</Text>
              </Text>
              <Text
                className="text-center mt-2"
                style={{
                  fontSize: 15,
                  color: '#555',
                  lineHeight: 22,
                }}
              >
                Sign in to unlock long-term trends, efficiency correlations,
                and predictive analytics based on your historical behavior.
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => router.push('/(auth)')} // Navigate to your auth screen
              className="flex-row items-center gap-3 px-7 py-3.5 rounded-xl mb-8"
              style={{ backgroundColor: '#7c6af0' }}
            >
              <Text className="text-white font-bold" style={{ fontSize: 14 }}>
                Sign In to View Analytics
              </Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>

            <View className="flex-row w-full gap-4">
              <View className="flex-1 p-4 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)', borderWidth: 1 }}>
                <Text style={{ fontSize: 10, color: '#444', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, mb: 4 }}>
                  Trends
                </Text>
                <Text style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
                  Visualize your growth over weeks and months.
                </Text>
              </View>
              <View className="flex-1 p-4 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)', borderWidth: 1 }}>
                <Text style={{ fontSize: 10, color: '#444', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, mb: 4 }}>
                  Correlations
                </Text>
                <Text style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
                  Find links between habits and task density.
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View>
            <StatCards cards={analytics.statCards} />
            
            <WeeklyActivityChart 
              data={analytics.weekActivity} 
              hasData={analytics.hasTaskData} 
            />
            
            <ProductivityScore 
              data={analytics.productivity} 
              hasData={analytics.hasTaskData || analytics.hasHabitData} 
            />
            
            <HabitBreakdown 
              habits={analytics.topHabits} 
              hasData={analytics.hasHabitData} 
            />
            
            <View className="mt-5">
              <GoalBreakdown 
                goals={analytics.goalProgress} 
                hasData={analytics.hasGoalData} 
              />
            </View>
            
            <View className="mt-5">
              <AIInsights 
                insights={analytics.aiInsights} 
                hasData={analytics.hasTaskData || analytics.hasHabitData || analytics.hasGoalData} 
              />
            </View>
          </View>
        )}
      </View>
    </ScreenLayout>
  );
}
