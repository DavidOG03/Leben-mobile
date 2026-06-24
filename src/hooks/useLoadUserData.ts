// hooks/useLoadUserData.ts
// After auth, loads all user data from Supabase into Zustand
import { useEffect } from 'react';
import { useLebenStore } from '@/store/useStore';

export function useLoadUserData() {
  const userId     = useLebenStore((s) => s.userId);
  const loadTasks  = useLebenStore((s) => s.loadTasks);
  const loadHabits = useLebenStore((s) => s.loadHabits);
  const loadGoals  = useLebenStore((s) => s.loadGoals);
  const loadBooks  = useLebenStore((s) => s.loadBooks);
  const loadHistory = useLebenStore((s) => s.loadHistory);

  useEffect(() => {
    if (!userId) return;
    loadTasks();
    loadHabits();
    loadGoals();
    loadBooks();
    loadHistory();
  }, [userId]);
}
