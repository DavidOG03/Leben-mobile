import { fetchBooks, insertBook, updateBook as updateBookDb, deleteBook } from '@/lib/supabase/db';

export interface Book {
  id: string;
  title: string;
  author: string;
  currentPage: number;
  totalPages: number;
  coverColor: string;
  status: "reading" | "completed" | "paused";
  addedAt: string;
}

export interface BookFormData {
  title: string;
  author: string;
  totalPages: number;
  coverColor: string;
}

export interface BookSlice {
  books: Book[];
  booksLoaded: boolean;
  loadBooks: () => Promise<void>;
  addBook: (data: BookFormData) => void;
  updateBook: (id: string, updates: Partial<Book>) => void;
  removeBook: (id: string) => void;
  setBooks: (books: Book[]) => void;
}

export function deriveBooksStats(books: Book[]) {
  const total = books.length;
  const completed = books.filter((b) => b.status === "completed").length;
  const reading = books.filter((b) => b.status === "reading").length;
  const totalPagesRead = books.reduce((sum, b) => sum + b.currentPage, 0);
  const totalPages = books.reduce((sum, b) => sum + b.totalPages, 0);
  const overallProgress =
    totalPages === 0 ? 0 : Math.round((totalPagesRead / totalPages) * 100);

  return {
    total,
    completed,
    reading,
    totalPagesRead,
    totalPages,
    overallProgress,
  };
}

export function bookProgress(book: Book): number {
  return book.totalPages === 0
    ? 0
    : Math.round((book.currentPage / book.totalPages) * 100);
}

function generateBookId(): string {
  return "book_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

export function createBookSlice(
  set: (updater: (state: any) => Partial<any> | Partial<any>) => void,
  get: () => any
): BookSlice {
  return {
    books: [],
    booksLoaded: false,

    loadBooks: async () => {
      if (get().booksLoaded) return;
      const books = await fetchBooks();
      set(() => ({ books, booksLoaded: true }));
    },

    addBook: async (data: BookFormData) => {
      const newBook: Book = {
        id: generateBookId(),
        title: data.title,
        author: data.author,
        currentPage: 0,
        totalPages: data.totalPages,
        coverColor: data.coverColor,
        status: "reading",
        addedAt: new Date().toISOString(),
      };
      set((state: any) => ({ books: [...state.books, newBook] }));
      await insertBook(newBook);
    },

    updateBook: async (id: string, updates: Partial<Book>) => {
      let updatedBook: Book | undefined;
      set((state: any) => ({
        books: state.books.map((b: Book) => {
          if (b.id !== id) return b;
          updatedBook = { ...b, ...updates };
          if (
            updatedBook.currentPage >= updatedBook.totalPages &&
            updatedBook.totalPages > 0
          ) {
            updatedBook.status = "completed";
            updatedBook.currentPage = updatedBook.totalPages;
          }
          return updatedBook;
        }),
      }));
      if (updatedBook) {
        await updateBookDb(id, updates);
      }
    },

    removeBook: async (id: string) => {
      set((state: any) => ({ books: state.books.filter((b: Book) => b.id !== id) }));
      await deleteBook(id);
    },

    setBooks: (books: Book[]) => set(() => ({ books })),
  };
}
