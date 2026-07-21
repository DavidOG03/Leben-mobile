import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import AddBookModal from "@/components/habits/AddBookModal";
import { AddHabitSheet } from "@/components/habits/AddHabitSheet";
import { HabitList } from "@/components/habits/HabitList";
import ReadingTracker from "@/components/habits/ReadingTracker";
import { ScreenLayout } from "@/components/shared/ScreenLayout";
import { Text } from "@/components/ui/Text";
import { useLebenStore } from "@/store/useStore";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";

export default function HabitsScreen() {
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showAddBook, setShowAddBook] = useState(false);
  const books = useLebenStore((s) => s.books);
  const addBook = useLebenStore((s) => s.addBook);

  return (
    <ScreenLayout scrollable>
      <DashboardHeader />
      <View className="flex-1 px-4 py-6">
        {/* Daily Rituals section */}
        <View className="flex-row flex-wrap items-center justify-between mb-4">
          <View>
            <Text
              className="text-leben-text font-bold text-3xl"
              style={{ letterSpacing: -0.2 }}
            >
              Daily Rituals
            </Text>
            <Text className="text-leben-text-muted text-[12px] mt-0.5 mb-1 text-wrap">
              Consistency is the bridge between goals and accomplishment.
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setShowAddSheet(true)}
            className="flex-row items-center gap-1.5 px-3 py-2 rounded-lg active:opacity-80 bg-leben-bg-element border border-leben-border-subtle"
          >
            <Text className="text-leben-text-2 text-[12px] font-medium">
              ＋ Add Habit
            </Text>
          </TouchableOpacity>
        </View>

        <HabitList />

        {/* Separator */}
        <View className="h-[1px] w-full my-6 bg-leben-border" />

        <ReadingTracker onShowAddBook={setShowAddBook} books={books} />
      </View>

      <AddHabitSheet
        visible={showAddSheet}
        onClose={() => setShowAddSheet(false)}
      />

      <AddBookModal
        visible={showAddBook}
        onAdd={addBook}
        onClose={() => setShowAddBook(false)}
      />
    </ScreenLayout>
  );
}
