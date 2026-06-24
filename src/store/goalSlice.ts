// store/goalSlice.ts — ported from the web's goalSlice.ts
import {
  deleteGoal,
  fetchGoals,
  insertGoal,
  updateGoal,
} from "@/lib/supabase/db";
import type { Goal } from "@/utils/goals.types";

export interface GoalSlice {
  goals: Goal[];
  goalsLoaded: boolean;
  loadGoals: () => Promise<void>;
  addGoal: (goal: Goal) => Promise<void>;
  editGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;
  updateGoalProgress: (id: string, currentValue: number) => Promise<void>;
  toggleMilestone: (goalId: string, milestoneId: string) => Promise<void>;
}

export function createGoalSlice(
  set: (updater: (state: any) => Partial<any>) => void,
  get: () => any,
): GoalSlice {
  return {
    goals: [],
    goalsLoaded: false,

    loadGoals: async () => {
      if (get().goalsLoaded) return;
      const goals = await fetchGoals();
      set(() => ({ goals, goalsLoaded: true }));
    },

    addGoal: async (goal) => {
      set((s) => ({ goals: [goal, ...s.goals] }));
      await insertGoal(goal);
    },

    editGoal: async (id, updates) => {
      set((s) => ({
        goals: s.goals.map((g: Goal) =>
          g.id === id ? { ...g, ...updates } : g,
        ),
      }));
      await updateGoal(id, updates);
    },

    removeGoal: async (id) => {
      set((s) => ({ goals: s.goals.filter((g: Goal) => g.id !== id) }));
      await deleteGoal(id);
    },

    updateGoalProgress: async (id, currentValue) => {
      set((s) => ({
        goals: s.goals.map((g: Goal) =>
          g.id === id ? { ...g, currentValue } : g,
        ),
      }));
      await updateGoal(id, { currentValue });
    },

    toggleMilestone: async (goalId, milestoneId) => {
      let updatedMilestones = [] as any[];
      set((s) => ({
        goals: s.goals.map((g: Goal) => {
          if (g.id === goalId) {
            updatedMilestones = g.milestones.map((m) =>
              m.id === milestoneId ? { ...m, completed: !m.completed } : m,
            );
            return { ...g, milestones: updatedMilestones };
          }
          return g;
        }),
      }));
      if (updatedMilestones.length > 0) {
        await updateGoal(goalId, { milestones: updatedMilestones });
      }
    },
  };
}
