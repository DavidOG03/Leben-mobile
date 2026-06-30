// lib/supabase/db.ts
// All database operations — ported from the web's db.ts
// Uses the mobile Supabase client (AsyncStorage-backed session)

import { supabase } from "@/lib/supabase/client";
import type { Task, Habit } from "@/store/useStore";
import type { Goal } from "@/utils/goals.types";
import type { Book } from "@/store/bookSlice";

// ── Helpers ────────────────────────────────────────────────────────────────────

function mapTaskFromDB(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed,
    tag: row.tag,
    date: row.date,
    createdAt: row.created_at,
    completedAt: row.completed_at,
    priority: row.priority,
    category: row.category,
    reminderAt: row.reminder_at,
  };
}

function mapTaskToDB(task: Partial<Task>) {
  const row: any = {};
  if (task.id) row.id = task.id;
  if (task.title !== undefined) row.title = task.title;
  if (task.completed !== undefined) row.completed = task.completed;
  if (task.tag !== undefined) row.tag = task.tag;
  if (task.date !== undefined) row.date = task.date;
  if (task.createdAt) row.created_at = task.createdAt;
  if (task.completedAt !== undefined) row.completed_at = task.completedAt;
  if (task.priority !== undefined) row.priority = task.priority;
  if (task.category !== undefined) row.category = task.category;
  if ("reminderAt" in task) {
    row.reminder_at = task.reminderAt ?? null;
    row.email_sent = false;
    row.push_sent = false;
  }
  return row;
}

function mapHabitFromDB(row: any): Habit {
  return {
    id: row.id,
    name: row.name,
    label: row.label ?? "",
    sub: row.sub ?? "",
    icon: row.icon ?? "",
    streak: row.streak ?? 0,
    longestStreak: row.longest_streak ?? 0,
    checked: row.checked ?? false,
    color: row.color ?? "#7c6af0",
    pct: row.pct ?? 0,
    completedDates: row.completed_dates ?? [],
    reminderAt: row.reminder_at,
  };
}

function mapHabitToDB(habit: Partial<Habit>) {
  const row: any = {};
  if (habit.id) row.id = habit.id;
  if (habit.name !== undefined) row.name = habit.name;
  if (habit.streak !== undefined) row.streak = habit.streak;
  if (habit.longestStreak !== undefined)
    row.longest_streak = habit.longestStreak;
  if (habit.checked !== undefined) row.checked = habit.checked;
  if (habit.color !== undefined) row.color = habit.color;
  if (habit.completedDates) row.completed_dates = habit.completedDates;
  if (habit.label !== undefined) row.label = habit.label;
  if (habit.sub !== undefined) row.sub = habit.sub;
  if (habit.icon !== undefined) row.icon = habit.icon;
  if (habit.pct !== undefined) row.pct = habit.pct;
  if ("reminderAt" in habit) {
    row.reminder_at = habit.reminderAt ?? null;
    row.email_sent = false;
    row.push_sent = false;
  }
  return row;
}

function mapGoalFromDB(row: any): Goal {
  return {
    id: row.id,
    title: row.title,
    name: row.title,
    deadline: row.deadline,
    icon: row.icon,
    milestones: row.milestones ?? [],
    tasksLinked: row.tasks_linked ?? 0,
    createdAt: row.created_at,
    color: row.color,
    targetValue: row.target_value ?? 0,
    currentValue: row.current_value ?? 0,
  };
}

function mapGoalToDB(goal: Partial<Goal>) {
  const row: any = {};
  if (goal.id) row.id = goal.id;
  if (goal.title !== undefined) row.title = goal.title;
  if (goal.deadline !== undefined) row.deadline = goal.deadline;
  if (goal.icon !== undefined) row.icon = goal.icon;
  if (goal.milestones !== undefined) row.milestones = goal.milestones;
  if (goal.tasksLinked !== undefined) row.tasks_linked = goal.tasksLinked;
  if (goal.createdAt !== undefined) row.created_at = goal.createdAt;
  if (goal.color !== undefined) row.color = goal.color;
  if (goal.targetValue !== undefined) row.target_value = goal.targetValue;
  if (goal.currentValue !== undefined) row.current_value = goal.currentValue;
  return row;
}

function mapBookFromDB(row: any): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    currentPage: row.current_page ?? 0,
    totalPages: row.total_pages ?? 0,
    coverColor: row.cover_color ?? "#555",
    status: row.status ?? "reading",
    addedAt: row.added_at ?? new Date().toISOString(),
  };
}

function mapBookToDB(book: Partial<Book>) {
  const row: any = {};
  if (book.id) row.id = book.id;
  if (book.title !== undefined) row.title = book.title;
  if (book.author !== undefined) row.author = book.author;
  if (book.currentPage !== undefined) row.current_page = book.currentPage;
  if (book.totalPages !== undefined) row.total_pages = book.totalPages;
  if (book.coverColor !== undefined) row.cover_color = book.coverColor;
  if (book.status !== undefined) row.status = book.status;
  if (book.addedAt !== undefined) row.added_at = book.addedAt;
  return row;
}

// ── Tasks ──────────────────────────────────────────────────────────────────────

export async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("fetchTasks:", error.message);
    return [];
  }
  return (data ?? []).map(mapTaskFromDB);
}

export async function insertTask(task: Task): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const dbRow = mapTaskToDB(task);
  const { error } = await supabase
    .from("tasks")
    .insert({ ...dbRow, user_id: user.id });
  if (error) console.error("insertTask:", error.message);
}

export async function updateTask(
  id: string,
  updates: Partial<Task>,
): Promise<void> {
  const dbRow = mapTaskToDB(updates);
  const { error } = await supabase.from("tasks").update(dbRow).eq("id", id);
  if (error) console.error("updateTask:", error.message);
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) console.error("deleteTask:", error.message);
}

// ── Habits ─────────────────────────────────────────────────────────────────────

export async function fetchHabits(): Promise<Habit[]> {
  const { data, error } = await supabase.from("habits").select("*");
  if (error) {
    console.error("fetchHabits:", error.message);
    return [];
  }
  return (data ?? []).map(mapHabitFromDB);
}

export async function insertHabit(habit: Habit): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const dbRow = mapHabitToDB(habit);
  const { error } = await supabase
    .from("habits")
    .insert({ ...dbRow, user_id: user.id });
  if (error) console.error("insertHabit:", error.message);
}

export async function updateHabit(
  id: string,
  updates: Partial<Habit>,
): Promise<void> {
  const dbRow = mapHabitToDB(updates);
  const { error } = await supabase.from("habits").update(dbRow).eq("id", id);
  if (error) console.error("updateHabit:", error.message);
}

export async function removeHabit(id: string): Promise<void> {
  const { error } = await supabase.from("habits").delete().eq("id", id);
  if (error) console.error("removeHabit:", error.message);
}

// ── Goals ──────────────────────────────────────────────────────────────────────

export async function fetchGoals(): Promise<Goal[]> {
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("fetchGoals:", error.message);
    return [];
  }
  return (data ?? []).map(mapGoalFromDB);
}

export async function insertGoal(goal: Goal): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const dbRow = mapGoalToDB(goal);
  const { error } = await supabase
    .from("goals")
    .insert({ ...dbRow, user_id: user.id });
  if (error) console.error("insertGoal:", error.message);
}

export async function updateGoal(
  id: string,
  updates: Partial<Goal>,
): Promise<void> {
  const dbRow = mapGoalToDB(updates);
  const { error } = await supabase.from("goals").update(dbRow).eq("id", id);
  if (error) console.error("updateGoal:", error.message);
}

export async function deleteGoal(id: string): Promise<void> {
  const { error } = await supabase.from("goals").delete().eq("id", id);
  if (error) console.error("deleteGoal:", error.message);
}

// ── Books ──────────────────────────────────────────────────────────────────────

export async function fetchBooks(): Promise<Book[]> {
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .order("added_at", { ascending: false });
  if (error) {
    console.error("fetchBooks:", error.message);
    return [];
  }
  return (data ?? []).map(mapBookFromDB);
}

export async function insertBook(book: Book): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const dbRow = mapBookToDB(book);
  const { error } = await supabase
    .from("books")
    .insert({ ...dbRow, user_id: user.id });
  if (error) console.error("insertBook:", error.message);
}

export async function updateBook(
  id: string,
  updates: Partial<Book>,
): Promise<void> {
  const dbRow = mapBookToDB(updates);
  const { error } = await supabase.from("books").update(dbRow).eq("id", id);
  if (error) console.error("updateBook:", error.message);
}

export async function deleteBook(id: string): Promise<void> {
  const { error } = await supabase.from("books").delete().eq("id", id);
  if (error) console.error("deleteBook:", error.message);
}

// ── Productivity History ───────────────────────────────────────────────────────

export async function fetchProductivityHistory(): Promise<
  Record<string, { completed: number; total: number }>
> {
  const { data, error } = await supabase
    .from("productivity_history")
    .select("*");
  if (error) {
    console.error("fetchProductivityHistory:", error.message);
    return {};
  }
  const history: Record<string, { completed: number; total: number }> = {};
  (data ?? []).forEach((row: any) => {
    history[row.date] = { completed: row.completed, total: row.total };
  });
  return history;
}

export async function upsertProductivityHistory(
  date: string,
  completed: number,
  total: number,
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase
    .from("productivity_history")
    .upsert(
      { user_id: user.id, date, completed, total },
      { onConflict: "user_id, date" },
    );
  if (error) console.error("upsertProductivityHistory:", error.message);
}

// ── Push Tokens (mobile — replaces web push_subscriptions) ───────────────────

export async function savePushToken(
  token: string,
  platform: string,
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase
    .from("push_tokens")
    .upsert({ user_id: user.id, token, platform }, { onConflict: "user_id" });
  if (error) console.error("savePushToken:", error.message);
}

// ── System ─────────────────────────────────────────────────────────────────────

export async function purgeAllData(): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  for (const table of [
    "tasks",
    "habits",
    "goals",
    "books",
    "productivity_history",
  ]) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq("user_id", user.id);
    if (error) console.error(`purge ${table}:`, error.message);
  }
}
