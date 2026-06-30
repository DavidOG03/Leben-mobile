export type ImportKind = 'task' | 'habit' | 'goal' | 'planner';

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
}

export interface MessageBlock {
  type: 'list' | 'paragraph';
  content: string[];
}

export interface ImportedEntityTracker {
  taskIds: string[];
  habitIds: string[];
  goalTitles: string[];
  plannerIds: string[];
}
