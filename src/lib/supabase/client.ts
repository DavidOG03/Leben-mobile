import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey  = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

class DummyWebSocket {}

// Dummy storage for Node SSR to prevent AsyncStorage crashing
const dummyStorage = {
  getItem: () => Promise.resolve(null),
  setItem: () => Promise.resolve(),
  removeItem: () => Promise.resolve(),
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage:          typeof window === 'undefined' ? dummyStorage : AsyncStorage,
    autoRefreshToken: true,
    persistSession:   true,
    detectSessionInUrl: false, // must be false for React Native
  },
  realtime: {
    transport: typeof window === 'undefined' ? (DummyWebSocket as any) : undefined,
  },
});
