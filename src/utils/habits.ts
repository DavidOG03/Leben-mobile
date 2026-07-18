// utils/habits.ts — aligned with web utils/habits.ts

// ── Constants (replaces the missing constants/habits file) ─────────────────────
export const WEEKS = 16;
export const DAYS  = 7;

// ── Date helpers ───────────────────────────────────────────────────────────────

/** Returns today's date as a YYYY-MM-DD string. */
export const today = () => new Date().toISOString().slice(0, 10);

// ── Heatmap helpers ────────────────────────────────────────────────────────────

/** Maps a completion ratio (0–1) to a heatmap colour. */
export const intensityColor = (ratio: number): string => {
  if (ratio <= 0)    return 'var(--bg-secondary)';
  if (ratio <= 0.25) return '#1e2a4a';
  if (ratio <= 0.5)  return '#2e4080';
  if (ratio <= 0.75) return '#5a4fd4';
  return 'var(--accent-blue-light)';
};

/**
 * Returns the ISO date string for the cell at grid position (week w, day d),
 * measured backwards from today.
 */
export function cellDate(w: number, d: number): string {
  const date = new Date();
  date.setDate(date.getDate() - (WEEKS - 1 - w) * 7 - (DAYS - 1 - d));
  return date.toISOString().slice(0, 10);
}

/** How many habits were completed on a given date. */
export function countOnDate(habits: { completedDates: string[] }[], dateStr: string): number {
  return habits.filter((h) => (h.completedDates ?? []).includes(dateStr)).length;
}

/**
 * Builds a WEEKS×DAYS matrix where each cell is the ratio of habits
 * completed on that day (0 = none, 1 = all habits done).
 */
export function buildAllHabitsMatrix(habits: { completedDates: string[] }[]): number[][] {
  const total = habits.length;
  return Array.from({ length: WEEKS }, (_, w) =>
    Array.from({ length: DAYS }, (_, d) => {
      if (total === 0) return 0;
      return countOnDate(habits, cellDate(w, d)) / total;
    }),
  );
}

// ── Streak helpers ─────────────────────────────────────────────────────────────

/**
 * Calculates the current daily streak from a completedDates array.
 * The streak is broken if neither today nor yesterday is present.
 */
export function calcStreak(history: string[]): number {
  if (!history || history.length === 0) return 0;

  // Normalize all dates to YYYY-MM-DD, remove duplicates
  const dates = new Set(history.map((d) => d.slice(0, 10)));

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  // If not done today AND not done yesterday, streak is broken
  if (!dates.has(todayStr) && !dates.has(yesterdayStr)) return 0;

  let streak = 0;
  // Start from today if completed today, otherwise start from yesterday
  const checkDate = dates.has(todayStr) ? new Date(now) : new Date(yesterday);

  while (true) {
    const checkStr = checkDate.toISOString().slice(0, 10);
    if (dates.has(checkStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculates the longest all-time streak from a completedDates array.
 */
export function calcLongestStreak(history: string[]): number {
  if (!history || history.length === 0) return 0;

  // Normalize to YYYY-MM-DD and sort chronologically (deduplicated)
  const sorted = Array.from(new Set(history.map((d) => d.slice(0, 10)))).sort();

  let maxStreak     = 0;
  let currentStreak = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 1) {
      currentStreak++;
    } else if (diff > 1) {
      if (currentStreak > maxStreak) maxStreak = currentStreak;
      currentStreak = 1;
    }
  }

  return Math.max(maxStreak, currentStreak);
}
