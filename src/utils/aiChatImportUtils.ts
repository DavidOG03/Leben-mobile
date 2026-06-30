import type { GoalFormData } from "@/utils/goals.types";
import type {
  ImportKind,
  MessageBlock,
  StructuredListItem,
} from "./aiChatTypes";

const LIST_ITEM_REGEX = /^(([*+-])|(\d+\.))\s+(.*)$/;
const MONTH_PATTERN =
  "(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)";
const SECTION_KIND_KEYWORDS: Record<ImportKind, string[]> = {
  task: [
    "task",
    "tasks",
    "todo",
    "to do",
    "action",
    "actions",
    "next step",
    "next steps",
  ],
  habit: ["habit", "habits", "routine", "routines", "ritual", "rituals"],
  goal: ["goal", "goals", "objective", "objectives", "target", "targets"],
  planner: [
    "planner",
    "schedule",
    "timeline",
    "plan",
    "time block",
    "time-block",
  ],
};

export const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\w\s:-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const stripMarkdownFormatting = (text: string) =>
  text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#+\s*/g, "")
    .trim();

export const cleanupImportedText = (text: string) =>
  stripMarkdownFormatting(text)
    .replace(/\s+/g, " ")
    .replace(/\s*([:;,.!?])\s*/g, "$1 ")
    .replace(/\s+\)/g, ")")
    .replace(/\(\s+/g, "(")
    .trim();

const makePersonalPhrase = (text: string) => {
  const cleaned = cleanupImportedText(text)
    .replace(/^(task|habit|goal)\s*:\s*/i, "")
    .replace(
      /^(you should|you need to|try to|consider|aim to|make sure to|be sure to)\s+/i,
      "",
    )
    .replace(
      /^(allocate time to|set aside time to|set aside time for|make time to|make time for|take time to|focus on|work on|prioritize|remember to|ensure you|plan to)\s+/i,
      "",
    )
    .replace(/^(complete)\s+/i, "finish ")
    .replace(/^(begin)\s+/i, "start ")
    .replace(/^(review and)\s+/i, "review ")
    .replace(/\s+[—–-]\s+(for|because|so that|which|with|to help)\b.*$/i, "")
    .replace(/:\s+(for|because|so that|which|with|to help)\b.*$/i, "")
    .replace(/\.$/, "")
    .trim();

  if (!cleaned) return "";
  if (/^[A-Z0-9]{2,}/.test(cleaned)) return cleaned;
  return cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
};

export const shortenImportedText = (
  text: string,
  options?: { maxChars?: number; maxWords?: number },
) => {
  const maxChars = options?.maxChars ?? 56;
  const maxWords = options?.maxWords ?? 9;
  const prioritized = makePersonalPhrase(text);
  if (!prioritized) return "";

  const words = prioritized.split(" ");
  let shortened = prioritized;

  if (words.length > maxWords) shortened = words.slice(0, maxWords).join(" ");
  if (shortened.length > maxChars) {
    shortened = shortened.slice(0, maxChars).replace(/\s+\S*$/, "");
  }
  if (shortened.length < prioritized.length) {
    shortened = `${shortened.trim().replace(/[.,;:!?-]+$/, "")}...`;
  }

  return shortened.trim();
};

const isStructuredSectionHeading = (line: string) => {
  const trimmed = line.trim();
  return !!trimmed && !LIST_ITEM_REGEX.test(trimmed) && /:\s*$/.test(trimmed);
};

const getSectionHint = (line: string) =>
  isStructuredSectionHeading(line) ? line.trim().replace(/:\s*$/, "") : null;

const isListGroupHeading = (text: string) => {
  const trimmed = text.trim();
  return (
    !!trimmed &&
    (/:\s*$/.test(trimmed) ||
      /^(weekdays?|weekends?|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i.test(
        trimmed,
      ) ||
      /^(morning|afternoon|evening|night)\b/i.test(trimmed) ||
      /\be\.g\./i.test(trimmed))
  );
};

const sectionImpliesKind = (section: string | null, kind: ImportKind) =>
  !!section &&
  SECTION_KIND_KEYWORDS[kind].some((keyword) =>
    normalizeText(section).includes(keyword),
  );

const parseTimeValue = (value: string) => {
  const match = value
    .trim()
    .toLowerCase()
    .match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2] ?? "0");
  if (match[3] === "pm" && hour < 12) hour += 12;
  if (match[3] === "am" && hour === 12) hour = 0;
  if (hour > 23 || minute > 59) return null;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

export const parsePlannerLine = (text: string) => {
  const match = text.match(
    /^(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*(?:-|â€“|â€”|to)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*(?:[:-]\s*)?(.+)$/i,
  );
  if (!match) return null;

  const start = parseTimeValue(match[1]);
  const end = parseTimeValue(match[2]);
  const remainder = cleanupImportedText(match[3] ?? "");
  if (!start || !end || !remainder) return null;

  const split = remainder.split(/\s[â€”â€“-]\s|:\s/, 2);
  const rawTitle = split[0]?.trim() ?? remainder;
  return {
    start,
    end,
    title:
      shortenImportedText(rawTitle, { maxChars: 44, maxWords: 6 }) || rawTitle,
    description:
      split.length > 1
        ? cleanupImportedText(
            remainder.slice(rawTitle.length).replace(/^\s*[:â€”â€“-]\s*/, ""),
          )
        : `Work on ${shortenImportedText(rawTitle, { maxChars: 44, maxWords: 6 }) || rawTitle}.`,
  };
};

const inferItemKind = (text: string, section: string | null): ImportKind => {
  if (sectionImpliesKind(section, "planner") || parsePlannerLine(text))
    return "planner";
  if (sectionImpliesKind(section, "habit")) return "habit";
  if (sectionImpliesKind(section, "goal")) return "goal";
  if (sectionImpliesKind(section, "task")) return "task";
  if (
    /\b(daily|every day|every morning|every evening|every night|weekly|each day|habit|routine)\b/.test(
      normalizeText(text),
    )
  ) {
    return "habit";
  }
  if (
    new RegExp(
      `\\b(by|before|within)\\b.*\\b${MONTH_PATTERN}|\\b\\d{4}\\b`,
      "i",
    ).test(text) ||
    /\b(goal|objective|target|milestone)\b/i.test(text)
  ) {
    return "goal";
  }
  return "task";
};

export const parseStructuredListItems = (
  content: string,
): StructuredListItem[] => {
  const items: StructuredListItem[] = [];
  let currentSection: string | null = null;

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const section = getSectionHint(trimmed);
    if (section) {
      currentSection = section;
      continue;
    }

    const prefixedMatch = trimmed.match(
      /^(tasks?|habits?|goals?|planner|schedule|timeline)\s*:\s+(.+)$/i,
    );
    if (prefixedMatch) {
      const label = prefixedMatch[1].toLowerCase();
      const text = prefixedMatch[2].trim();
      const kind: ImportKind = label.startsWith("task")
        ? "task"
        : label.startsWith("habit")
          ? "habit"
          : label.startsWith("goal")
            ? "goal"
            : "planner";

      if (text) {
        items.push({
          raw: trimmed,
          text,
          section: currentSection,
          kind,
        });
      }
      continue;
    }

    const listMatch = trimmed.match(LIST_ITEM_REGEX);
    if (!listMatch) continue;

    const text = listMatch[4].trim();
    if (!text) continue;
    if (isListGroupHeading(text)) {
      currentSection = text.replace(/:\s*$/, "");
      continue;
    }

    items.push({
      raw: trimmed,
      text,
      section: currentSection,
      kind: inferItemKind(text, currentSection),
    });
  }

  return items;
};

export const parseAssistantContent = (content: string): MessageBlock[] => {
  const blocks: MessageBlock[] = [];
  let currentList: string[] = [];
  const flushList = () => {
    if (currentList.length > 0)
      blocks.push({ type: "list", content: currentList });
    currentList = [];
  };

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (isStructuredSectionHeading(trimmed)) {
      flushList();
      blocks.push({ type: "paragraph", content: [trimmed] });
    } else {
      const listMatch = trimmed.match(LIST_ITEM_REGEX);
      if (listMatch) currentList.push(listMatch[4].trim());
      else if (trimmed === "") flushList();
      else {
        flushList();
        blocks.push({ type: "paragraph", content: [trimmed] });
      }
    }
  }
  flushList();
  return blocks;
};

export const detectRequestedKinds = (text: string) => {
  const normalized = text.toLowerCase().replace(/[^\w\s]/g, " ");
  const kinds: ImportKind[] = [];
  if (/\b(habit|habits|routine|routines)\b/.test(normalized))
    kinds.push("habit");
  if (/\b(goal|goals|objective|objectives)\b/.test(normalized))
    kinds.push("goal");
  if (/\b(planner|schedule|timeline|plan)\b/.test(normalized))
    kinds.push("planner");
  if (/\b(task|tasks|tasklist|task list|to do|todo)\b/.test(normalized))
    kinds.push("task");
  return kinds;
};

export const isListImportRequest = (text: string) => {
  const normalized = text.toLowerCase().replace(/[^\w\s]/g, " ");
  return (
    /\b(add|import|save|create|put)\b/.test(normalized) &&
    /\b(these|those|them|this list|that list|the list)\b/.test(normalized) &&
    (detectRequestedKinds(text).length > 0 ||
      /\b(list|lists|tracker|trackers)\b/.test(normalized))
  );
};

export const parseDirectAddRequest = (text: string) => {
  const trimmed = text.trim();
  const patterns: Array<{ kind: ImportKind; regex: RegExp }> = [
    {
      kind: "task",
      regex:
        /^(?:please\s+)?add(?:\s+(?:a|an))?\s+task(?:\s+(?:called|named))?\s+(.+)$/i,
    },
    {
      kind: "habit",
      regex:
        /^(?:please\s+)?add(?:\s+(?:a|an))?\s+habit(?:\s+(?:called|named))?\s+(.+)$/i,
    },
    {
      kind: "goal",
      regex:
        /^(?:please\s+)?add(?:\s+(?:a|an))?\s+goal(?:\s+(?:called|named))?\s+(.+)$/i,
    },
    {
      kind: "goal",
      regex:
        /^(?:please\s+)?(?:i\s+want\s+to|i'd\s+like\s+to|i\s+would\s+like\s+to)\s+achieve\s+(.+)$/i,
    },
    {
      kind: "goal",
      regex: /^(?:please\s+)?my\s+goal\s+is\s+to\s+(.+)$/i,
    },
    {
      kind: "goal",
      regex:
        /^(?:please\s+)?help\s+me\s+(?:set|create|add)\s+(?:a\s+)?goal\s+to\s+(.+)$/i,
    },
    {
      kind: "goal",
      regex: /^(?:please\s+)?i\s+want\s+to\s+work\s+towards\s+(.+)$/i,
    },
    {
      kind: "goal",
      regex: /^i\s+want\s+to\s+work\s+towards\s+(.+)$/i,
    },
    {
      kind: "goal",
      regex: /^i\s+want\s+to\s+be\s+(.+)$/i,
    },
    {
      kind: "planner",
      regex:
        /^(?:please\s+)?add(?:\s+(?:this|a|an))?\s+(?:timeline item|planner item|schedule item|time block|timeblock)(?:\s+(?:called|named))?\s+(.+)$/i,
    },
    {
      kind: "planner",
      regex:
        /^(?:please\s+)?add\s+to\s+(?:my\s+)?(?:planner|schedule|timeline)\s+(.+)$/i,
    },
    {
      kind: "planner",
      regex: /^add\s+to\s+(?:my\s+)?(?:planner|schedule|timeline)\s+(.+)$/i,
    },
  ];
  for (const pattern of patterns) {
    const match = trimmed.match(pattern.regex);
    if (match) return { kind: pattern.kind, text: match[1].trim() };
  }
  return null;
};

export const getImportStateKey = (messageId: string, kinds?: ImportKind[]) => 
  kinds ? `${messageId}-${kinds.join('-')}` : messageId;

export const resolveImportKinds = (detected: ImportKind[]): ImportKind[] => detected;

export const buildHabitDraft = (text: string) => {
  const label = shortenImportedText(text, { maxChars: 44, maxWords: 6 }) || text;
  return { label, sub: "Daily Habit" };
}

export const buildGoalDraft = (text: string): GoalFormData => {
  const title = shortenImportedText(text, { maxChars: 44, maxWords: 6 }) || text;
  return { title, targetValue: 10, currentValue: 0, deadline: "", icon: "🎯", color: "#4a90d9", milestones: [] };
}

export const summarizeCounts = (counts: Partial<Record<ImportKind, number>>) => {
  const parts: string[] = [];
  if (counts.task) parts.push(`${counts.task} task${counts.task > 1 ? 's' : ''}`);
  if (counts.habit) parts.push(`${counts.habit} habit${counts.habit > 1 ? 's' : ''}`);
  if (counts.goal) parts.push(`${counts.goal} goal${counts.goal > 1 ? 's' : ''}`);
  if (counts.planner) parts.push(`${counts.planner} planner item${counts.planner > 1 ? 's' : ''}`);
  return parts.join(', ');
};

export const getImportButtonLabel = (counts: Partial<Record<ImportKind, number>>, imported: boolean) => {
  if (imported) return "Imported";
  return `Import ${summarizeCounts(counts)}`;
};
