// store/useStore.ts — main Zustand store, ported from the web's useStore.ts
// Uses zustand persist middleware with AsyncStorage for session persistence

import { create }          from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage        from '@react-native-async-storage/async-storage';

import {
  fetchTasks, insertTask, updateTask, deleteTask,
  fetchHabits, insertHabit, updateHabit, removeHabit,
  fetchProductivityHistory, upsertProductivityHistory,
} from '@/lib/supabase/db';
import { calcStreak, calcLongestStreak } from '@/utils/habits';
import { createGoalSlice, type GoalSlice } from './goalSlice';
import { createBookSlice, type BookSlice } from './bookSlice';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Task {
  id:          string;
  title:       string;
  completed:   boolean;
  tag?:        string;
  date?:       string;
  createdAt?:  string;
  completedAt?: string | null;
  priority?:   'low' | 'medium' | 'high';
  category?:   string;
  reminderAt?: string | null;
}

export interface Habit {
  id:             string;
  name:           string;
  label:          string;
  sub:            string;
  icon:           string;
  streak:         number;
  longestStreak:  number;
  checked:        boolean;
  color:          string;
  pct:            number;
  completedDates: string[];
  reminderAt?:    string | null;
  frequency?:         'daily' | 'weekly';
  targetDaysPerWeek?: number;
  timeOfDay?:         'morning' | 'afternoon' | 'evening' | 'anytime';
  createdAt?:         string;
}

export interface ScheduleBlock {
  time:        string;
  title:       string;
  tag:         string;
  description: string;
  status:      'pending' | 'completed' | 'skipped';
}

export interface AIInsight { type: string; text: string }

export interface DayPlan {
  mainFocus:    string;
  schedule:     ScheduleBlock[];
  insights:     AIInsight[];
  generatedAt?: string;
}

interface ProductivityRecord {
  completed: number;
  total:     number;
}

export interface LebenStore extends GoalSlice, BookSlice {
  // ── Auth ────────────────────────────────────────────────────────────────────
  userId:       string | null;
  userEmail:    string | null;
  userFullName: string | null;
  setUser:      (id: string | null, email: string | null, fullName?: string | null) => void;

  // ── Tasks ───────────────────────────────────────────────────────────────────
  tasks:        Task[];
  tasksLoaded:  boolean;
  loadTasks:    () => Promise<void>;
  addTask:      (task: Task) => Promise<void>;
  toggleTask:   (id: string) => Promise<void>;
  editTask:     (id: string, updates: Partial<Task>) => Promise<void>;
  removeTask:   (id: string) => Promise<void>;

  // ── Habits ──────────────────────────────────────────────────────────────────
  habits:        Habit[];
  habitsLoaded:  boolean;
  loadHabits:    () => Promise<void>;
  addHabit:      (habit: Habit) => Promise<void>;
  toggleHabit:   (id: string) => Promise<void>;
  editHabit:     (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit:   (id: string) => Promise<void>;

  // ── Planner ─────────────────────────────────────────────────────────────────
  dayPlan:             DayPlan | null;
  plannerLoading:      boolean;
  plannerError:        string | null;
  setDayPlan:          (plan: DayPlan | null) => void;
  toggleScheduleBlock: (index: number) => Promise<void>;

  // ── Productivity History ─────────────────────────────────────────────────────
  productivityHistory: Record<string, ProductivityRecord>;
  historyLoaded:       boolean;
  loadHistory:         () => Promise<void>;
  saveHistory:         (date: string) => Promise<void>;

  // ── UI ───────────────────────────────────────────────────────────────────────
  isSidebarOpen:  boolean;
  toggleSidebar:  (value?: boolean) => void;

  // ── System ───────────────────────────────────────────────────────────────────
  clearStore: () => void;
}

// ── Initial State ──────────────────────────────────────────────────────────────

const initialState = {
  userId:       null,
  userEmail:    null,
  userFullName: null,
  tasks:        [],
  tasksLoaded:  false,
  habits:       [],
  habitsLoaded: false,
  goals:        [],
  goalsLoaded:  false,
  books:        [],
  booksLoaded:  false,
  dayPlan:      null,
  plannerLoading: false,
  plannerError:   null,
  productivityHistory: {},
  historyLoaded:  false,
  isSidebarOpen:  false,
};

// ── Store ──────────────────────────────────────────────────────────────────────

export const useLebenStore = create<LebenStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Merge in goal and book slices
      ...createGoalSlice(set, get),
      ...createBookSlice(set, get),

      // ── Auth ─────────────────────────────────────────────────────────────────
      setUser: (id, email, fullName = null) => {
        set({ userId: id, userEmail: email, userFullName: fullName });
      },

      // ── Tasks ─────────────────────────────────────────────────────────────────
      loadTasks: async () => {
        if (get().tasksLoaded) return;
        const tasks = await fetchTasks();
        set({ tasks, tasksLoaded: true });
      },

      addTask: async (task) => {
        set((s) => ({ tasks: [task, ...s.tasks] }));
        await insertTask(task);
      },

      toggleTask: async (id) => {
        const tasks = get().tasks;
        const task  = tasks.find((t) => t.id === id);
        if (!task) return;
        const completedAt = task.completed ? null : new Date().toISOString();
        const updates = { completed: !task.completed, completedAt };
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
        await updateTask(id, updates);
        await get().saveHistory(new Date().toISOString().split('T')[0]);
      },

      editTask: async (id, updates) => {
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
        await updateTask(id, updates);
      },

      removeTask: async (id) => {
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
        await deleteTask(id);
      },

      // ── Habits ────────────────────────────────────────────────────────────────
      loadHabits: async () => {
        if (get().habitsLoaded) return;
        const habits = await fetchHabits();
        set({ habits, habitsLoaded: true });
      },

      addHabit: async (habit) => {
        set((s) => ({ habits: [habit, ...s.habits] }));
        await insertHabit(habit);
      },

      toggleHabit: async (id) => {
        const today   = new Date().toISOString().split('T')[0];
        const habits  = get().habits;
        const habit   = habits.find((h) => h.id === id);
        if (!habit) return;

        const alreadyDone = habit.completedDates.includes(today);
        const newDates    = alreadyDone
          ? habit.completedDates.filter((d) => d !== today)
          : [...habit.completedDates, today];

        const streak        = calcStreak(newDates);
        const longestStreak = Math.max(habit.longestStreak, streak);
        const checked       = !alreadyDone;
        const updates       = { completedDates: newDates, streak, longestStreak, checked };

        set((s) => ({
          habits: s.habits.map((h) =>
            h.id === id ? { ...h, ...updates } : h,
          ),
        }));
        await updateHabit(id, updates);
      },

      editHabit: async (id, updates) => {
        set((s) => ({
          habits: s.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        }));
        await updateHabit(id, updates);
      },

      deleteHabit: async (id) => {
        set((s) => ({ habits: s.habits.filter((h) => h.id !== id) }));
        await removeHabit(id);
      },

      // ── Planner ───────────────────────────────────────────────────────────────
      setDayPlan: (plan) => set({ dayPlan: plan }),

      toggleScheduleBlock: async (index) => {
        const plan = get().dayPlan;
        if (!plan) return;
        const schedule = plan.schedule.map((block, i) =>
          i === index
            ? { ...block, status: block.status === 'completed' ? 'pending' : 'completed' as any }
            : block,
        );
        set({ dayPlan: { ...plan, schedule } });
      },

      // ── Productivity History ──────────────────────────────────────────────────
      loadHistory: async () => {
        if (get().historyLoaded) return;
        const history = await fetchProductivityHistory();
        set({ productivityHistory: history, historyLoaded: true });
      },

      saveHistory: async (date) => {
        const tasks     = get().tasks;
        const completed = tasks.filter((t) => t.completed && t.completedAt?.startsWith(date)).length;
        const total     = tasks.filter((t) => !t.date || t.date <= date).length;
        set((s) => ({
          productivityHistory: {
            ...s.productivityHistory,
            [date]: { completed, total },
          },
        }));
        await upsertProductivityHistory(date, completed, total);
      },

      // ── UI ────────────────────────────────────────────────────────────────────
      isSidebarOpen: false,
      toggleSidebar: (value) =>
        set((s) => ({ isSidebarOpen: value !== undefined ? value : !s.isSidebarOpen })),

      // ── System ────────────────────────────────────────────────────────────────
      clearStore: () =>
        set({
          ...initialState,
          tasks:        [],
          habits:       [],
          goals:        [],
          books:        [],
          productivityHistory: {},
        }),
    }),
    {
      name:    'leben-store',
      storage: createJSONStorage(() => 
        typeof window === 'undefined' 
          ? { getItem: () => Promise.resolve(null), setItem: () => Promise.resolve(), removeItem: () => Promise.resolve() } 
          : AsyncStorage
      ),
      // Only persist non-sensitive, UI-recoverable data
      partialize: (state) => ({
        userId:              state.userId,
        userEmail:           state.userEmail,
        userFullName:        state.userFullName,
        productivityHistory: state.productivityHistory,
        dayPlan:             state.dayPlan,
      }),
    },
  ),
);
