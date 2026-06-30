// store/goalSlice.ts — aligned with web goalSlice.ts
import {
  deleteGoal,
  fetchGoals,
  insertGoal,
  updateGoal,
} from '@/lib/supabase/db';
import {
  Goal,
  GoalFormData,
  Milestone,
  generateGoalId,
  generateMilestoneId,
} from '@/utils/goals.types';

export interface GoalSlice {
  goals:              Goal[];
  goalsLoaded:        boolean;
  loadGoals:          () => Promise<void>;
  addGoal:            (data: GoalFormData | Goal) => Promise<void>;
  editGoal:           (id: string, updates: Partial<Goal>) => Promise<void>;
  updateGoal:         (id: string, updates: Partial<Goal>) => Promise<void>; // alias
  removeGoal:         (id: string) => Promise<void>;
  updateGoalProgress: (id: string, currentValue: number) => Promise<void>;
  toggleMilestone:    (goalId: string, milestoneId: string) => Promise<void>;
  editMilestone:      (goalId: string, milestoneId: string, newLabel: string) => Promise<void>;
}

export function createGoalSlice(
  set: (updater: (state: any) => Partial<any>) => void,
  get: () => any,
): GoalSlice {
  return {
    goals:       [],
    goalsLoaded: false,

    loadGoals: async () => {
      if (get().goalsLoaded) return;
      const goals = await fetchGoals();
      set(() => ({ goals, goalsLoaded: true }));
    },

    addGoal: async (data) => {
      let newGoal: Goal;

      // Accept either a full Goal object (legacy callers) or GoalFormData
      if ('milestones' in data && Array.isArray((data as any).milestones) &&
          (data as any).milestones.length > 0 &&
          typeof (data as any).milestones[0] === 'string') {
        // GoalFormData path — milestones are raw strings
        const fd = data as GoalFormData;
        const milestones: Milestone[] = (fd.milestones as string[])
          .filter((m) => m.trim() !== '')
          .map((label) => ({
            id:   generateMilestoneId(),
            label,
            done: false,
          }));
        newGoal = {
          id:           generateGoalId(),
          title:        fd.title,
          name:         fd.title,
          deadline:     fd.deadline,
          icon:         fd.icon,
          milestones,
          tasksLinked:  0,
          createdAt:    new Date().toISOString(),
          color:        fd.color,
          targetValue:  fd.targetValue,
          currentValue: fd.currentValue,
          reminderAt:   fd.reminderAt,
        };
      } else {
        // Full Goal object passed directly
        newGoal = data as Goal;
      }

      set((s) => ({ goals: [newGoal, ...s.goals] }));
      await insertGoal(newGoal);
    },

    editGoal: async (id, updates) => {
      set((s) => ({
        goals: s.goals.map((g: Goal) =>
          g.id === id ? { ...g, ...updates } : g,
        ),
      }));
      await updateGoal(id, updates);
    },

    // Alias kept for back-compat
    updateGoal: async (id, updates) => {
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
      let updatedMilestones: Milestone[] = [];
      set((s) => ({
        goals: s.goals.map((g: Goal) => {
          if (g.id !== goalId) return g;
          updatedMilestones = g.milestones.map((m) => {
            if (m.id !== milestoneId) return m;
            const newDone = !m.done;
            return {
              ...m,
              done:        newDone,
              completedAt: newDone
                ? new Date().toISOString().split('T')[0]
                : undefined,
            };
          });
          return { ...g, milestones: updatedMilestones };
        }),
      }));
      if (updatedMilestones.length > 0) {
        await updateGoal(goalId, { milestones: updatedMilestones });
      }
    },

    editMilestone: async (goalId, milestoneId, newLabel) => {
      let updatedMilestones: Milestone[] = [];
      set((s) => ({
        goals: s.goals.map((g: Goal) => {
          if (g.id !== goalId) return g;
          updatedMilestones = g.milestones.map((m) =>
            m.id === milestoneId ? { ...m, label: newLabel } : m,
          );
          return { ...g, milestones: updatedMilestones };
        }),
      }));
      if (updatedMilestones.length > 0) {
        await updateGoal(goalId, { milestones: updatedMilestones });
      }
    },
  };
}
