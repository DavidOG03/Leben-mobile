import React, { useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import AIChatMessages from './AIChatMessages';
import { useAIChatPanel } from '@/hooks/useAIChatPanel';

const suggestions = [
  { label: 'Analyze my productivity' },
  { label: 'Generate task list' },
  { label: 'Optimize my schedule' },
];

export default function AIChatPanel() {
  const {
    messages,
    input,
    setInput,
    isThinking,
    importedMessageIds,
    sendMessage,
    importAssistantMessage,
  } = useAIChatPanel();

  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
      style={{ borderRightWidth: 1, borderRightColor: '#161616' }}
    >
      <AIChatMessages
        messages={messages}
        isThinking={isThinking}
        importedMessageIds={importedMessageIds}
        onImport={importAssistantMessage}
        scrollViewRef={scrollViewRef}
      />

      <View className="px-4 pb-2 pt-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {suggestions.map((suggestion) => (
            <TouchableOpacity
              key={suggestion.label}
              onPress={() => sendMessage(suggestion.label)}
              className="px-4 py-2 rounded-xl border border-[#1a1a1a]"
              style={{ backgroundColor: '#0e0e0e' }}
            >
              <Text style={{ color: '#888', fontSize: 12 }}>
                {suggestion.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View className="px-4 pb-6 pt-2 border-t border-white/5">
        <View
          className="flex-row items-center gap-3 rounded-2xl px-4 py-2 min-h-[50px]"
          style={{ backgroundColor: '#0c0c0c', borderWidth: 1, borderColor: '#1e1e1e' }}
        >
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
            className="w-9 h-9 rounded-xl items-center justify-center border"
            style={{
              backgroundColor: input.trim() ? '#2d2480' : '#1a1a1a',
              borderColor: input.trim() ? '#3a3060' : '#222',
              opacity: (input.trim() && !isThinking) ? 1 : 0.5,
            }}
          >
            <Text className="text-white text-lg leading-none mt-[-2px]">↑</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center justify-center gap-2 mt-4 opacity-40">
          <View className="h-[1px] flex-1 bg-white/20" />
          <Text
            style={{
              fontSize: 9,
              color: '#888',
              letterSpacing: 1.5,
              fontWeight: '700',
            }}
          >
            NEURAL ENGINE V1.0
          </Text>
          <View className="h-[1px] flex-1 bg-white/20" />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
