// store/bookSlice.ts — ported from the web's bookSlice.ts
import { fetchBooks, insertBook, updateBook, deleteBook } from '@/lib/supabase/db';

export interface Book {
  id:          string;
  title:       string;
  author:      string;
  currentPage: number;
  totalPages:  number;
  coverColor:  string;
  status:      'reading' | 'completed' | 'paused' | 'want-to-read';
  addedAt:     string;
}

export interface BookSlice {
  books:       Book[];
  booksLoaded: boolean;
  loadBooks:   () => Promise<void>;
  addBook:     (book: Book) => Promise<void>;
  editBook:    (id: string, updates: Partial<Book>) => Promise<void>;
  removeBook:  (id: string) => Promise<void>;
  updateReadingProgress: (id: string, currentPage: number) => Promise<void>;
}

export function createBookSlice(
  set: (updater: (state: any) => Partial<any>) => void,
  get: () => any,
): BookSlice {
  return {
    books:       [],
    booksLoaded: false,

    loadBooks: async () => {
      if (get().booksLoaded) return;
      const books = await fetchBooks();
      set(() => ({ books, booksLoaded: true }));
    },

    addBook: async (book) => {
      set((s) => ({ books: [book, ...s.books] }));
      await insertBook(book);
    },

    editBook: async (id, updates) => {
      set((s) => ({
        books: s.books.map((b: Book) => (b.id === id ? { ...b, ...updates } : b)),
      }));
      await updateBook(id, updates);
    },

    removeBook: async (id) => {
      set((s) => ({ books: s.books.filter((b: Book) => b.id !== id) }));
      await deleteBook(id);
    },

    updateReadingProgress: async (id, currentPage) => {
      set((s) => ({
        books: s.books.map((b: Book) => (b.id === id ? { ...b, currentPage } : b)),
      }));
      await updateBook(id, { currentPage });
    },
  };
}
