// hooks/useAuthSync.ts
// Listens to Supabase auth state changes and syncs into Zustand
import { useEffect } from 'react';
import { Alert } from 'react-native';
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const state = useLebenStore.getState();
        const prevUserId = state.userId;
        const offlineQueueLength = state.offlineQueue.length;
        
        const meta = session.user.user_metadata;
        setUser(
          session.user.id,
          session.user.email ?? null,
          meta?.full_name ?? meta?.name ?? null,
        );

        if (event === 'SIGNED_IN') {
          // If they were a guest and have local data
          if (prevUserId === null && offlineQueueLength > 0) {
            Alert.alert(
              "Guest Data Found",
              "You have items created in guest mode. Would you like to merge them into your account, or discard them and start fresh?",
              [
                {
                  text: "Discard",
                  style: "destructive",
                  onPress: () => {
                    useLebenStore.getState().clearStore();
                    setUser(
                      session.user.id,
                      session.user.email ?? null,
                      meta?.full_name ?? meta?.name ?? null,
                    );
                    useLebenStore.setState({ 
                      tasksLoaded: false, habitsLoaded: false, goalsLoaded: false, booksLoaded: false, historyLoaded: false 
                    });
                  }
                },
                {
                  text: "Keep & Merge",
                  onPress: () => {
                    useLebenStore.getState().processOfflineQueue();
                    useLebenStore.setState({ 
                      tasksLoaded: false, habitsLoaded: false, goalsLoaded: false, booksLoaded: false, historyLoaded: false 
                    });
                  }
                }
              ]
            );
          } else {
            // Normal sign in or no guest data
            useLebenStore.setState({ 
              tasksLoaded: false, habitsLoaded: false, goalsLoaded: false, booksLoaded: false, historyLoaded: false 
            });
          }
        }
      } else {
        setUser(null, null, null);
        if (event === 'SIGNED_OUT') {
          useLebenStore.getState().clearStore();
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser]);
}
