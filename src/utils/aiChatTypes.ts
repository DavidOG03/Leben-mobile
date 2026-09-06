export type ImportKind = 'task' | 'habit' | 'goal' | 'planner' | 'book' | 'unknown';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

export interface StructuredListItem {
  raw: string;
  text: string;
  section: string | null;
  kind: ImportKind;
  milestones?: string[]; // only populated for goals
  deadline?: string;     // only populated for goals
}

export type MessageBlock =
  | { type: 'paragraph'; content: string[] }
  | { type: 'heading';   content: string; headingLevel: number }
  | { type: 'list';      items: Array<{ text: string; kind: ImportKind; milestones?: string[]; deadline?: string; bullet?: string }> };

export interface ImportedEntityTracker {
  taskIds:    string[];
  habitIds:   string[];
  goalTitles: string[];
  plannerIds: string[];
  bookTitles: string[];
}

