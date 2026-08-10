import { Book } from "@/store/bookSlice";
import { Habit } from "@/store/useStore";

export type { Book } from "@/store/bookSlice";

export interface DailyRitualProps {
  setShowAddHabit: (show: boolean) => void;
  habits: Habit[];
  onSelectedHabitId: (id: string | null) => void;
  activeHabit: Habit | null;
  toggleHabit: (id: string) => void;
}

export interface WeeklyProgressProps {
  habits: Habit[];
}

export interface ReadingTrackerProps {
  onShowAddBook: (show: boolean) => void;
  books: Book[];
}

export interface ConsistencyScoreProps {
  habits: Habit[];
  consistencyScore: number;
  checkedCount: number;
  books: Book[];
}
