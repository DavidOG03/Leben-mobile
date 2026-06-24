// utils/habits.ts — ported from the web's utils/habits.ts

/**
 * Calculates the current streak: consecutive days ending today (or yesterday).
 * A "day" is a YYYY-MM-DD string.
 */
export function calcStreak(dates: string[]): number {
  if (!dates || dates.length === 0) return 0;

  const sorted = [...dates].sort().reverse(); // most recent first
  const today     = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr  = today.toISOString().split('T')[0];

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Streak must start from today or yesterday
  if (sorted[0] !== todayStr && sorted[0] !== yesterdayStr) return 0;

  let streak  = 1;
  let current = new Date(sorted[0]);
  current.setHours(0, 0, 0, 0);

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i]);
    prev.setHours(0, 0, 0, 0);

    const diff = (current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      streak++;
      current = prev;
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Calculates the longest ever streak in the completed dates array.
 */
export function calcLongestStreak(dates: string[]): number {
  if (!dates || dates.length === 0) return 0;

  const sorted = [...new Set(dates)].sort(); // asc, deduplicated
  let longest = 1;
  let current = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    prev.setHours(0, 0, 0, 0);
    curr.setHours(0, 0, 0, 0);

    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      current++;
      if (current > longest) longest = current;
    } else {
      current = 1;
    }
  }
  return longest;
}
