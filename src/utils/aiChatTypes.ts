export type ImportKind = 'task' | 'habit' | 'goal' | 'planner' | 'book';

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
}

export type MessageBlock =
  | { type: 'paragraph'; content: string[] }
  | { type: 'heading';   content: string; headingLevel: number }
  | { type: 'list';      items: Array<{ text: string; kind: ImportKind; milestones?: string[] }> };

export interface ImportedEntityTracker {
  taskIds:    string[];
  habitIds:   string[];
  goalTitles: string[];
  plannerIds: string[];
  bookTitles: string[];
}

