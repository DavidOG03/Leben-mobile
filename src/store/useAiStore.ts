import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
  time: string;
  thinking?: boolean;
}

interface AIState {
  messages: Message[];
  isThinking: boolean;
  lastUpdated: number;
  addMessage: (message: Message) => void;
  setThinking: (thinking: boolean) => void;
  removeMessage: (id: string) => void;
  clearChat: () => void;
  checkCacheExpiry: () => void;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: `${getGreeting()}. I'm Leben AI, your neural productivity engine. How can I help optimize your workspace today?`,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  },
];

export const useAIStore = create<AIState>()(
  persist(
    (set, get) => ({
      messages: initialMessages,
      isThinking: false,
      lastUpdated: Date.now(),
      addMessage: (msg) =>
        set((state) => ({
          messages: [...state.messages, msg],
          lastUpdated: Date.now(),
        })),
      setThinking: (isThinking) => set({ isThinking }),
      removeMessage: (id) =>
        set((state) => ({
          messages: state.messages.filter((m) => m.id !== id),
          lastUpdated: Date.now(),
        })),
      clearChat: () =>
        set({
          messages: initialMessages,
          lastUpdated: Date.now(),
        }),
      checkCacheExpiry: () => {
        const state = get();
        // 24 hours in milliseconds
        if (Date.now() - state.lastUpdated > 24 * 60 * 60 * 1000) {
          state.clearChat();
        }
      },
    }),
    {
      name: "leben-ai-chat-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        messages: state.messages,
        lastUpdated: state.lastUpdated,
      }), // Don't persist isThinking
    },
  ),
);
