import { Text } from "@/components/ui/Text";
import { useAIChatPanel } from "@/hooks/useAIChatPanel";
import { useRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useColorScheme } from "nativewind";
import { SendIcon } from "../../constants/Icons";
import AIChatMessages from "./AIChatMessages";

const suggestions = [
  { label: "How am I doing this week?" },
  { label: "Help me plan my tasks" },
  { label: "What should I focus on today?" },
];

export default function AIChatPanel() {
  const { colorScheme } = useColorScheme();
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
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 110 : 90}
      style={{ flex: 1 }}
      className="border-r border-leben-border-subtle"
    >
      <View style={{ flex: 1 }}>
        <AIChatMessages
          messages={messages}
          isThinking={isThinking}
          importedMessageIds={importedMessageIds}
          onImport={importAssistantMessage}
          scrollViewRef={scrollViewRef}
        />
      </View>

      <View className="px-4 pb-2 pt-2">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {suggestions.map((suggestion) => (
            <TouchableOpacity
              key={suggestion.label}
              onPress={() => sendMessage(suggestion.label)}
              className="px-4 py-2 rounded-xl border border-leben-border-subtle bg-leben-bg-secondary"
            >
              <Text className="text-leben-text-muted text-[12px]">
                {suggestion.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View className="px-4 pb-6 pt-2 border-t border-leben-border-subtle">
        <View className="flex-row items-center gap-3 rounded-2xl px-4 py-2 min-h-[50px] bg-leben-bg-card border border-leben-border">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask me anything..."
            placeholderTextColor={colorScheme === "dark" ? "#888899" : "#888899"}
            multiline
            className="flex-1 text-leben-text-2 text-[14px] max-h-32 py-2"
          />
          <TouchableOpacity
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || isThinking}
            className={`w-9 h-9 rounded-xl items-center justify-center border ${
              input.trim()
                ? "bg-leben-accent-dim border-leben-accent/40"
                : "bg-leben-bg-element border-leben-border-subtle"
            }`}
            style={{
              opacity: input.trim() && !isThinking ? 1 : 0.5,
            }}
          >
            <Text className="text-leben-text text-lg leading-none mt-[-2px]">
              <SendIcon 
                color={
                  input.trim() 
                    ? "#6b7fff" 
                    : colorScheme === "dark" ? "#a0a0b0" : "#707080"
                } 
                size={16} 
              />
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
