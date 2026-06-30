// utils/goals.types.ts — aligned with web goals.types.ts

export interface Milestone {
  id:          string;
  label:       string;   // web uses 'label', not 'title'
  done:        boolean;  // web uses 'done', not 'completed'
  completedAt?: string;
}

export interface Goal {
  id:           string;
  title:        string;
  name:         string;   // alias for title
  deadline?:    string;
  icon?:        string;
  milestones:   Milestone[];
  tasksLinked:  number;
  createdAt?:   string;
  color?:       string;
  targetValue:  number;
  currentValue: number;
}

export interface GoalFormData {
  color:        string;
  targetValue:  number;
  currentValue: number;
  title:        string;
  deadline:     string;
  icon:         string;
  milestones:   string[]; // raw strings converted to Milestone on save
}

export interface DerivedGoalStats {
  progress:    number; // 0-100
  status:      GoalStatus;
  statusColor: string;
  daysLeft:    number;
}

export type GoalStatus =
  | 'ACTIVE'
  | 'STEADY'
  | 'ACCELERATED'
  | 'AT RISK'
  | 'COMPLETE';

export const STATUS_COLORS: Record<GoalStatus, string> = {
  ACTIVE:       '#7c6af0',
  STEADY:       '#888',
  ACCELERATED:  '#9d8ff5',
  'AT RISK':    '#e05c5c',
  COMPLETE:     '#4caf8a',
};

/** Pure utility: derive stats from a Goal object — never stored. */
export function deriveGoalStats(goal: Goal): DerivedGoalStats {
  const milestones = goal.milestones ?? [];
  const total      = milestones.length;
  const done       = milestones.filter((m) => m.done).length;
  const progress   = total === 0 ? 0 : Math.round((done / total) * 100);

  const deadlineDate = goal.deadline ? new Date(goal.deadline) : null;
  const now          = new Date();
  const daysLeft     = deadlineDate
    ? Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : Infinity;

  let status: GoalStatus;
  if (progress === 100) {
    status = 'COMPLETE';
  } else if (daysLeft < 0) {
    status = 'AT RISK';
  } else if (progress >= 70) {
    status = 'ACCELERATED';
  } else if (progress >= 30) {
    status = 'ACTIVE';
  } else {
    status = 'STEADY';
  }

  return {
    progress,
    status,
    statusColor: STATUS_COLORS[status],
    daysLeft: daysLeft === Infinity ? 0 : daysLeft,
  };
}

export function generateMilestoneId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function generateGoalId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}
