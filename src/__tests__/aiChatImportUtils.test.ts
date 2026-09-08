/**
 * Unit tests for aiChatImportUtils.ts
 * Covers: text cleanup, import parsing, goal deadline extraction, generic list detection
 */

import {
  cleanupImportedText,
  stripMarkdownFormatting,
  parseStructuredListItems,
  parseAssistantContent,
  buildGoalDraft,
  buildHabitDraft,
  buildBookDraft,
  getImportButtonLabel,
  summarizeCounts,
} from '../utils/aiChatImportUtils';

// ── cleanupImportedText ────────────────────────────────────────────────────────

describe('cleanupImportedText', () => {
  it('capitalises the first character', () => {
    expect(cleanupImportedText('review the code')).toMatch(/^R/);
  });

  it('strips bold markdown', () => {
    expect(cleanupImportedText('**Bold text**')).toBe('Bold text');
  });

  it('strips italic markdown', () => {
    expect(cleanupImportedText('*italic text*')).toBe('Italic text');
  });

  it('strips inline code', () => {
    expect(cleanupImportedText('`some code`')).toBe('Some code');
  });

  it('collapses multiple spaces', () => {
    expect(cleanupImportedText('too   many   spaces')).toBe('Too many spaces');
  });

  it('returns empty string unchanged', () => {
    expect(cleanupImportedText('')).toBe('');
  });
});

// ── stripMarkdownFormatting ───────────────────────────────────────────────────

describe('stripMarkdownFormatting', () => {
  it('converts markdown links to plain text', () => {
    expect(stripMarkdownFormatting('[Google](https://google.com)')).toBe('Google');
  });

  it('removes heading markers', () => {
    expect(stripMarkdownFormatting('### My Heading')).toBe('My Heading');
  });
});

// ── parseStructuredListItems ──────────────────────────────────────────────────

describe('parseStructuredListItems', () => {
  it('parses task lines prefixed with -', () => {
    const items = parseStructuredListItems('- Buy groceries\n- Call dentist');
    expect(items).toHaveLength(2);
    expect(items[0].kind).toBe('task');
    expect(items[0].text).toBe('Buy groceries');
  });

  it('parses habit lines prefixed with +', () => {
    const items = parseStructuredListItems('+ Morning run\n+ Read 20 pages');
    expect(items).toHaveLength(2);
    expect(items[0].kind).toBe('habit');
    expect(items[1].text).toBe('Read 20 pages');
  });

  it('parses goal lines prefixed with >', () => {
    const items = parseStructuredListItems('> Learn Spanish | 2026-12 | Basics, Grammar');
    expect(items).toHaveLength(1);
    expect(items[0].kind).toBe('goal');
    expect(items[0].text).toBe('Learn Spanish');
  });

  it('parses book lines prefixed with ~', () => {
    const items = parseStructuredListItems('~ Atomic Habits by James Clear');
    expect(items).toHaveLength(1);
    expect(items[0].kind).toBe('book');
    expect(items[0].text).toBe('Atomic Habits by James Clear');
  });

  it('ignores blank lines', () => {
    const items = parseStructuredListItems('- Task one\n\n- Task two\n');
    expect(items).toHaveLength(2);
  });
});

// ── Goal deadline parsing ─────────────────────────────────────────────────────

describe('Goal deadline parsing in parseStructuredListItems', () => {
  it('extracts YYYY-MM deadline when present', () => {
    const items = parseStructuredListItems('> Run a 5K | 2026-10 | Train 3x/week, Race day');
    expect(items[0].deadline).toBe('2026-10');
    expect(items[0].milestones).toEqual(['Train 3x/week', 'Race day']);
  });

  it('treats second segment as milestones when not a date', () => {
    const items = parseStructuredListItems('> Read more | Finish current book, Start next');
    expect(items[0].deadline).toBe('');
    expect(items[0].milestones).toEqual(['Finish current book', 'Start next']);
  });

  it('handles goal with only a deadline and no milestones', () => {
    const items = parseStructuredListItems('> Lose weight | 2027-03');
    expect(items[0].deadline).toBe('2027-03');
    expect(items[0].milestones).toEqual([]);
  });
});

// ── parseAssistantContent ─────────────────────────────────────────────────────

describe('parseAssistantContent', () => {
  it('splits content into paragraph and list blocks', () => {
    const content = 'Here is your plan.\n\n- Task one\n- Task two';
    const blocks = parseAssistantContent(content);
    expect(blocks.some(b => b.type === 'paragraph')).toBe(true);
    expect(blocks.some(b => b.type === 'list')).toBe(true);
  });

  it('creates heading blocks for ### lines', () => {
    const blocks = parseAssistantContent('### My Section\nSome text');
    expect(blocks[0].type).toBe('heading');
    expect((blocks[0] as any).content).toBe('My Section');
    expect((blocks[0] as any).headingLevel).toBe(3);
  });

  it('parses generic markdown bullet lists as unknown kind', () => {
    const blocks = parseAssistantContent('* First item\n* Second item');
    const listBlock = blocks.find(b => b.type === 'list') as any;
    expect(listBlock).toBeDefined();
    expect(listBlock.items[0].kind).toBe('unknown');
    expect(listBlock.items[0].bullet).toBe('*');
  });

  it('parses numbered lists as unknown kind', () => {
    const blocks = parseAssistantContent('1. Step one\n2. Step two');
    const listBlock = blocks.find(b => b.type === 'list') as any;
    expect(listBlock.items[0].kind).toBe('unknown');
  });

  it('merges consecutive prose lines into one paragraph block', () => {
    const blocks = parseAssistantContent('Line one\nLine two\nLine three');
    const paragraphs = blocks.filter(b => b.type === 'paragraph');
    expect(paragraphs).toHaveLength(1);
    expect((paragraphs[0] as any).content).toHaveLength(3);
  });
});

// ── buildGoalDraft ────────────────────────────────────────────────────────────

describe('buildGoalDraft', () => {
  it('sets the title from text', () => {
    const draft = buildGoalDraft('run a marathon');
    expect(draft.title).toMatch(/marathon/i);
  });

  it('uses provided deadline', () => {
    const draft = buildGoalDraft('Run a 5K', [], '2026-09');
    expect(draft.deadline).toBe('2026-09');
  });

  it('defaults deadline to empty string when not provided', () => {
    const draft = buildGoalDraft('Some goal');
    expect(draft.deadline).toBe('');
  });

  it('converts milestone strings into the draft', () => {
    const draft = buildGoalDraft('Learn piano', ['Week 1 basics', 'Play a song'], '2027-01');
    expect(draft.milestones).toEqual(['Week 1 basics', 'Play a song']);
  });
});

// ── buildHabitDraft ───────────────────────────────────────────────────────────

describe('buildHabitDraft', () => {
  it('creates a habit with a label', () => {
    const draft = buildHabitDraft('Morning journaling');
    expect(draft.label).toMatch(/journaling/i);
  });

  it('sets the sub to "Daily Habit"', () => {
    const draft = buildHabitDraft('Anything');
    expect(draft.sub).toBe('Daily Habit');
  });
});

// ── buildBookDraft ────────────────────────────────────────────────────────────

describe('buildBookDraft', () => {
  it('parses "Title by Author" format', () => {
    const draft = buildBookDraft('Atomic Habits by James Clear');
    expect(draft.title).toBe('Atomic Habits');
    expect(draft.author).toBe('James Clear');
  });

  it('handles missing author gracefully', () => {
    const draft = buildBookDraft('Some Untitled Book');
    expect(draft.title).toBe('Some Untitled Book');
    expect(draft.author).toBe('');
  });

  it('defaults totalPages to 300', () => {
    const draft = buildBookDraft('Any Book by Author');
    expect(draft.totalPages).toBe(300);
  });
});

// ── summarizeCounts / getImportButtonLabel ────────────────────────────────────

describe('summarizeCounts', () => {
  it('pluralises correctly for multiple items', () => {
    expect(summarizeCounts({ task: 3, habit: 1 })).toBe('3 tasks, 1 habit');
  });

  it('handles single item', () => {
    expect(summarizeCounts({ goal: 1 })).toBe('1 goal');
  });
});

describe('getImportButtonLabel', () => {
  it('returns "Imported" when imported is true', () => {
    expect(getImportButtonLabel({ task: 2 }, true)).toBe('Imported');
  });

  it('returns import label when not yet imported', () => {
    expect(getImportButtonLabel({ task: 2, habit: 1 }, false)).toContain('Import');
  });
});
