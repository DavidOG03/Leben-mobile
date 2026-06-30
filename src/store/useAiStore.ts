import { create } from "zustand";

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
  addMessage: (message: Message) => void;
  setThinking: (thinking: boolean) => void;
  clearChat: () => void;
}

export const useAIStore = create<AIState>((set) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return {
    messages: [
      {
        id: "1",
        role: "assistant",
        content: `${getGreeting()}. I'm Leben AI, your neural productivity engine. How can I help optimize your workspace today?`,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ],
    isThinking: false,
    addMessage: (msg) =>
      set((state) => ({ messages: [...state.messages, msg] })),
    setThinking: (isThinking) => set({ isThinking }),
    clearChat: () => set({ messages: [] }),
  };
});
