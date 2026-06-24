// utils/goals.types.ts — ported from the web

export interface Milestone {
  id:        string;
  title:     string;
  completed: boolean;
}

export interface Goal {
  id:           string;
  title:        string;
  name:         string;   // alias for title (used in some components)
  deadline?:    string;   // ISO date string
  icon?:        string;
  milestones:   Milestone[];
  tasksLinked:  number;
  createdAt?:   string;
  color?:       string;
  targetValue:  number;
  currentValue: number;
}

export function deriveGoalStats(goal: Goal) {
  const completedMilestones = goal.milestones?.filter(m => m.completed).length || 0;
  const totalMilestones = goal.milestones?.length || 0;
  
  // If we have a target value (e.g. read 10 books), use that. Otherwise use milestones.
  let progress = 0;
  if (goal.targetValue > 0) {
    progress = Math.round((goal.currentValue / goal.targetValue) * 100);
  } else if (totalMilestones > 0) {
    progress = Math.round((completedMilestones / totalMilestones) * 100);
  }

  progress = Math.min(progress, 100);

  let status = 'ON TRACK';
  let statusColor = '#4caf70';
  
  if (progress === 100) {
    status = 'COMPLETED';
    statusColor = '#7c6af0';
  } else if (goal.deadline && new Date(goal.deadline) < new Date()) {
    status = 'OVERDUE';
    statusColor = '#f06a6a';
  }

  return { progress, status, statusColor };
}
