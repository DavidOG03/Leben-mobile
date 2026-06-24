import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLebenStore } from '@/store/useStore';
import { sendAIChat } from '@/lib/ai/client';
import { Card } from '@/components/ui/Card';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function AIChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const tasks = useLebenStore((s) => s.tasks);
  const habits = useLebenStore((s) => s.habits);
  const goals = useLebenStore((s) => s.goals);
  const schedule = useLebenStore((s) => s.dayPlan?.schedule || []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isThinking) return;

    const userMessage: Message = { id: Math.random().toString(), role: 'user', content: text.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      
      const response = await sendAIChat([{ role: 'user', content: text.trim() }], { tasks, habits, goals, schedule });
      
      const assistantMessage: Message = { id: Math.random().toString(), role: 'assistant', content: response.message };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: Message = { id: Math.random().toString(), role: 'assistant', content: 'Sorry, I encountered an error connecting to the neural engine.' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
      keyboardVerticalOffset={100}
    >
      <ScrollView 
        ref={scrollViewRef}
        className="flex-1 p-4"
        contentContainerStyle={{ paddingBottom: 20 }}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 ? (
          <View className="items-center justify-center py-20 mt-10">
            <View className="w-16 h-16 rounded-2xl items-center justify-center mb-6 border border-[#252535]" style={{ backgroundColor: '#141420' }}>
              <Text className="text-[#7c6af0] text-3xl">✦</Text>
            </View>
            <Text className="text-white font-bold text-2xl mb-2">Neural Assistant</Text>
            <Text className="text-[#666] text-[13px] text-center px-6 leading-relaxed mb-8">
              I am connected to your tasks, habits, and goals. How can I help you optimize your life today?
            </Text>

            <View className="flex-row flex-wrap justify-center gap-2 px-4">
              {['Analyze my productivity', 'Optimize my schedule', 'Generate task list'].map((suggestion) => (
                <TouchableOpacity
                  key={suggestion}
                  onPress={() => sendMessage(suggestion)}
                  className="px-4 py-2 rounded-xl border border-[#1a1a1a] bg-[#0e0e0e]"
                >
                  <Text className="text-[#888] text-[12px]">{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          messages.map((m) => (
            <View 
              key={m.id} 
              className={`mb-4 max-w-[85%] ${m.role === 'user' ? 'self-end' : 'self-start'}`}
            >
              {m.role === 'assistant' && (
                <Text className="text-[#7c6af0] text-[10px] uppercase font-bold tracking-widest mb-1 ml-1">Neural</Text>
              )}
              <View 
                className={`p-4 rounded-2xl border ${m.role === 'user' ? 'bg-[#2d2480] border-[#3a3060] rounded-tr-sm' : 'bg-[#111] border-[#1e1e1e] rounded-tl-sm'}`}
              >
                <Text className={m.role === 'user' ? 'text-white' : 'text-[#ccc]'} style={{ fontSize: 14, lineHeight: 22 }}>
                  {m.content}
                </Text>
              </View>
            </View>
          ))
        )}
        
        {isThinking && (
          <View className="self-start mb-4 max-w-[85%]">
            <Text className="text-[#7c6af0] text-[10px] uppercase font-bold tracking-widest mb-1 ml-1">Neural</Text>
            <View className="p-4 rounded-2xl border bg-[#111] border-[#1e1e1e] rounded-tl-sm items-center justify-center w-20">
              <ActivityIndicator size="small" color="#7c6af0" />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View className="px-4 py-3 border-t border-[#1a1a1a] bg-[#0a0a0a]">
        <View className="flex-row items-end gap-2 bg-[#0c0c0c] border border-[#1e1e1e] rounded-2xl px-4 py-2 min-h-[50px]">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask neural engine..."
            placeholderTextColor="#555"
            multiline
            className="flex-1 text-white text-[14px] max-h-32 py-2"
          />
          <TouchableOpacity
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || isThinking}
            className="w-9 h-9 rounded-xl items-center justify-center mb-1 border"
            style={{ 
              backgroundColor: input.trim() ? '#2d2480' : '#1a1a1a',
              borderColor: input.trim() ? '#3a3060' : '#222',
              opacity: (input.trim() && !isThinking) ? 1 : 0.5
            }}
          >
            <Text className="text-white text-lg leading-none mt-[-2px]">↑</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
