// hooks/useAuthSync.ts
// Listens to Supabase auth state changes and syncs into Zustand
import { useEffect } from 'react';
import { supabase }  from '@/lib/supabase/client';
import { useLebenStore } from '@/store/useStore';

export function useAuthSync() {
  const setUser = useLebenStore((s) => s.setUser);

  useEffect(() => {
    // Set initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const meta = session.user.user_metadata;
        setUser(
          session.user.id,
          session.user.email ?? null,
          meta?.full_name ?? meta?.name ?? null,
        );
      }
    });

    // Subscribe to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata;
        setUser(
          session.user.id,
          session.user.email ?? null,
          meta?.full_name ?? meta?.name ?? null,
        );
      } else {
        setUser(null, null, null);
        useLebenStore.getState().clearStore();
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser]);
}
