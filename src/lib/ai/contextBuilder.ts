import { supabase } from "@/lib/supabase/client";

export interface UserContext {
  contextString: string;
  hasData: boolean;
}

export async function buildUserContext(): Promise<UserContext> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return {
      contextString: "No user data available. User is not authenticated.",
      hasData: false,
    };
  }

  const [tasksRes, habitsRes, goalsRes, booksRes] = await Promise.all([
    supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .eq("completed", false),
    supabase.from("habits").select("*").eq("user_id", user.id),
    supabase.from("goals").select("*").eq("user_id", user.id),
    supabase.from("books").select("*").eq("user_id", user.id),
  ]);

  const tasks = tasksRes.data || [];
  const habits = habitsRes.data || [];
  const goals = goalsRes.data || [];
  const books = booksRes.data || [];

  const contextSegments: string[] = [];

  if (tasks.length > 0) {
    contextSegments.push(
      " ACTIVE TASKS\n" +
        tasks
          .map(
            (t) =>
              `- [${t.priority || "med"}] ${t.title}${t.tag ? ` (${t.tag})` : ""}`,
          )
          .join("\n"),
    );
  } else {
    contextSegments.push(" ACTIVE TASKS\nYou have no pending tasks.");
  }

  if (habits.length > 0) {
    contextSegments.push(
      " HABITS & STREAK\n" +
        habits
          .map(
            (h) =>
              `- ${h.name}: Current Streak: ${h.streak} days (Longest: ${h.longest_streak || 0})`,
          )
          .join("\n"),
    );
  }

  if (goals.length > 0) {
    contextSegments.push(
      " GOALS\n" +
        goals
          .map(
            (g) =>
              `- ${g.title}: Progress: ${g.current_value}/${g.target_value} (Deadline: ${g.deadline || "None"})`,
          )
          .join("\n"),
    );
  }

  if (books.length > 0) {
    contextSegments.push(
      " READING LIST\n" +
        books
          .map(
            (b) =>
              `- "${b.title}" by ${b.author}: ${b.current_page}/${b.total_pages} pages (${b.status})`,
          )
          .join("\n"),
    );
  }

  const contextString = contextSegments.join("\n\n");
  const hasData =
    tasks.length > 0 ||
    habits.length > 0 ||
    goals.length > 0 ||
    books.length > 0;

  return { contextString, hasData };
}
