import { useRef, useState } from "react";
import { useAIStore } from "@/store/useAiStore";
import { useLebenStore } from "@/store/useStore";
import type { Habit, ScheduleItem } from "@/store/useStore";
import type { ImportedEntityTracker, ImportKind } from "@/utils/aiChatTypes";
import {
  buildGoalDraft,
  buildHabitDraft,
  cleanupImportedText,
  detectRequestedKinds,
  getImportStateKey,
  isListImportRequest,
  parseDirectAddRequest,
  parsePlannerLine,
  parseStructuredListItems,
  resolveImportKinds,
  shortenImportedText,
  summarizeCounts,
} from "@/utils/aiChatImportUtils";
import { sendAIChat } from "@/lib/ai/client";

export function useAIChatPanel() {
  const messages = useAIStore((s) => s.messages);
  const addMessage = useAIStore((s) => s.addMessage);
  const isThinking = useAIStore((s) => s.isThinking);
  const setThinking = useAIStore((s) => s.setThinking);
  
  const tasks = useLebenStore((s) => s.tasks);
  const habits = useLebenStore((s) => s.habits);
  const goals = useLebenStore((s) => s.goals);
  const schedule = useLebenStore((s) => s.schedule);
  const addTask = useLebenStore((s) => s.addTask);
  const deleteTask = useLebenStore((s) => s.removeTask);
  const addHabit = useLebenStore((s) => s.addHabit);
  const removeHabit = useLebenStore((s) => s.deleteHabit);
  const addGoal = useLebenStore((s) => s.addGoal);
  const removeGoal = useLebenStore((s) => s.removeGoal);
  const setSchedule = useLebenStore((s) => s.setSchedule);

  const [input, setInput] = useState("");
  const [importedMessageIds, setImportedMessageIds] = useState<
    Record<string, boolean>
  >({});
  const importedTrackerRef = useRef<ImportedEntityTracker>({
    taskIds: [],
    habitIds: [],
    goalTitles: [],
    plannerIds: [],
  });

  const postAssistantMessage = (content: string) =>
    addMessage({
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });

  const findLatestAssistantList = (requestedKinds?: ImportKind[]) => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      const message = messages[index];
      if (message.role !== "assistant") continue;
      const items = parseStructuredListItems(message.content);
      if (items.length === 0) continue;
      if (
        requestedKinds?.length &&
        !items.some((item) => requestedKinds.includes(item.kind))
      )
        continue;
      return { message, items };
    }
    return null;
  };

  const clearPreviousImports = (kinds: Set<ImportKind>) => {
    const tracker = importedTrackerRef.current;
    if (kinds.has("task")) {
      tracker.taskIds.forEach(
        (id) => tasks.some((task) => task.id === id) && deleteTask(id),
      );
      tracker.taskIds = [];
    }
    if (kinds.has("habit")) {
      tracker.habitIds.forEach(
        (id) => habits.some((habit) => habit.id === id) && removeHabit(id),
      );
      tracker.habitIds = [];
    }
    if (kinds.has("goal")) {
      tracker.goalTitles.forEach((title) => {
        const goal = goals.find((item) => item.title === title);
        if (goal) removeGoal(goal.id);
      });
      tracker.goalTitles = [];
    }
    if (kinds.has("planner")) {
      setSchedule(
        schedule.filter((item) => !tracker.plannerIds.includes(item.id)),
      );
      tracker.plannerIds = [];
    }
  };

  const createHabit = (text: string): Habit => {
    const draft = buildHabitDraft(text);
    return {
      id: `h${Date.now()}${Math.random().toString(36).slice(2, 5)}`,
      label: draft.label,
      sub: draft.sub,
      streak: 0,
      longestStreak: 0,
      color: "#4a90d9",
      icon: "🎯",
      checked: false,
      completedDates: [],
      name: draft.label,
      pct: 0,
    };
  };

  const createPlannerItem = (text: string): ScheduleItem | null => {
    const parsed = parsePlannerLine(text);
    if (!parsed) return null;
    return {
      id: `schedule-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      start: parsed.start,
      end: parsed.end,
      title: parsed.title,
      description: parsed.description,
      tag: "PLAN",
      priority: "medium",
      status: "pending",
    };
  };

  const importItems = (
    contentItems: ReturnType<typeof parseStructuredListItems>,
    messageId?: string,
    importKinds?: ImportKind[],
  ) => {
    const counts: Partial<Record<ImportKind, number>> = {};
    const kinds = new Set(contentItems.map((item) => item.kind));
    const previousPlannerIds = [...importedTrackerRef.current.plannerIds];
    const createdTaskIds: string[] = [];
    const createdHabitIds: string[] = [];
    const createdGoalTitles: string[] = [];
    const plannerItems: ScheduleItem[] = [];
    const now = new Date().toISOString();

    clearPreviousImports(kinds);

    contentItems.forEach((item) => {
      if (item.kind === "planner") {
        const plannerItem = createPlannerItem(item.text);
        if (plannerItem) plannerItems.push(plannerItem);
      } else if (item.kind === "habit") {
        const habit = createHabit(item.text);
        addHabit(habit);
        createdHabitIds.push(habit.id);
      } else if (item.kind === "goal") {
        const goal = buildGoalDraft(item.text);
        addGoal(goal);
        createdGoalTitles.push(goal.title);
      } else {
        const id = Math.random().toString();
        addTask({
          id,
          title:
            shortenImportedText(item.text, { maxChars: 52, maxWords: 8 }) ||
            cleanupImportedText(item.text),
          completed: false,
          tag: "WORK",
          priority: "medium",
          date: now.slice(0, 10),
          createdAt: now,
        });
        createdTaskIds.push(id);
      }
      counts[item.kind] = (counts[item.kind] ?? 0) + 1;
    });

    if (kinds.has("planner")) {
      setSchedule([
        ...schedule.filter((item) => !previousPlannerIds.includes(item.id)),
        ...plannerItems,
      ]);
    }

    importedTrackerRef.current = {
      taskIds: kinds.has("task")
        ? createdTaskIds
        : importedTrackerRef.current.taskIds,
      habitIds: kinds.has("habit")
        ? createdHabitIds
        : importedTrackerRef.current.habitIds,
      goalTitles: kinds.has("goal")
        ? createdGoalTitles
        : importedTrackerRef.current.goalTitles,
      plannerIds: kinds.has("planner")
        ? plannerItems.map((item) => item.id)
        : importedTrackerRef.current.plannerIds,
    };

    if (messageId) {
      setImportedMessageIds({
        ...importedMessageIds,
        [getImportStateKey(messageId, importKinds)]: true,
      });
    }

    return counts;
  };

  const importAssistantMessage = (messageId: string, content: string) =>
    importItems(parseStructuredListItems(content), messageId);

  const handleDirectAdd = (kind: ImportKind, text: string) => {
    if (kind === "task") {
      const now = new Date().toISOString();
      addTask({
        id: Math.random().toString(),
        title:
          shortenImportedText(text, { maxChars: 52, maxWords: 8 }) ||
          cleanupImportedText(text),
        completed: false,
        tag: "WORK",
        priority: "medium",
        date: now.slice(0, 10),
        createdAt: now,
      });
      postAssistantMessage("Added 1 task to your task list.");
      return true;
    }
    if (kind === "habit") {
      addHabit(createHabit(text));
      postAssistantMessage("Added 1 habit to your habit tracker.");
      return true;
    }
    if (kind === "goal") {
      addGoal(buildGoalDraft(text));
      postAssistantMessage("Added 1 goal to your goal tracker.");
      return true;
    }
    const plannerItem = createPlannerItem(text);
    if (!plannerItem) {
      postAssistantMessage(
        "I couldn't parse that planner item. Use a time range like 9:00 AM - 10:00 AM deep work.",
      );
      return true;
    }
    setSchedule([...schedule, plannerItem]);
    postAssistantMessage("Added 1 planner block to your Daily Planner.");
    return true;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isThinking) return;
    const trimmedText = text.trim();
    const userMsg: any = {
      id: Date.now().toString(),
      role: "user",
      content: trimmedText,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    addMessage(userMsg);
    setInput("");

    const directRequest = parseDirectAddRequest(trimmedText);
    if (directRequest)
      return void handleDirectAdd(directRequest.kind, directRequest.text);

    if (isListImportRequest(trimmedText)) {
      const resolvedKinds = resolveImportKinds(
        detectRequestedKinds(trimmedText),
      );
      const latest = findLatestAssistantList(resolvedKinds);
      if (!latest)
        return void postAssistantMessage(
          "I couldn't find a recent list to import. Ask me to generate one first, then I can add it for you.",
        );

      const importKey = getImportStateKey(
        latest.message.id,
        resolvedKinds.length > 0 ? resolvedKinds : undefined,
      );
      if (importedMessageIds[importKey])
        return void postAssistantMessage(
          "That list has already been imported.",
        );

      const items =
        resolvedKinds.length > 0
          ? latest.items.filter((item) => resolvedKinds.includes(item.kind))
          : latest.items;
      return void postAssistantMessage(
        `Imported ${summarizeCounts(importItems(items, latest.message.id, resolvedKinds.length > 0 ? resolvedKinds : undefined))}.`,
      );
    }

    setThinking(true);
    try {
      const response = await sendAIChat(
        [{ role: 'user', content: trimmedText }],
        { tasks, habits, goals, schedule }
      );
      
      if (response && response.message) {
        addMessage({
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.message,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
      }
    } catch (error) {
      console.error(error);
      postAssistantMessage("Sorry, I encountered an error connecting to the neural engine.");
    } finally {
      setThinking(false);
    }
  };

  return {
    messages,
    input,
    setInput,
    isThinking,
    importedMessageIds,
    sendMessage,
    importAssistantMessage,
  };
}
