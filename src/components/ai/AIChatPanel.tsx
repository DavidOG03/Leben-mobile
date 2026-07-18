import { useAIChatPanel } from "@/hooks/useAIChatPanel";
import { useRef } from "react";
import { KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View, } from 'react-native';
import { SendIcon } from "../../constants/Icons";
import AIChatMessages from "./AIChatMessages";
import { Text } from '@/components/ui/Text';


const suggestions = [
  { label: "Analyze my productivity" },
  { label: "Generate task list" },
  { label: "Optimize my schedule" },
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
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
      style={{ borderRightWidth: 1, borderRightColor: "#161616" }}
    >
      <AIChatMessages
        messages={messages}
        isThinking={isThinking}
        importedMessageIds={importedMessageIds}
        onImport={importAssistantMessage}
        scrollViewRef={scrollViewRef}
      />

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
              className="px-4 py-2 rounded-xl border border-leben-border-subtle"
              style={{ backgroundColor: "#0e0e0e" }}
            >
              <Text style={{ color: "#888", fontSize: 12 }}>
                {suggestion.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View className="px-4 pb-6 pt-2 border-t border-white/5">
        <View
          className="flex-row items-center gap-3 rounded-2xl px-4 py-2 min-h-[50px]"
          style={{
            backgroundColor: "#0c0c0c",
            borderWidth: 1,
            borderColor: "#1e1e1e",
          }}
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
              backgroundColor: input.trim() ? "#2d2480" : "#1a1a1a",
              borderColor: input.trim() ? "#3a3060" : "#222",
              opacity: input.trim() && !isThinking ? 1 : 0.5,
            }}
          >
            <Text className="text-white text-lg leading-none mt-[-2px]">
              <SendIcon />
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
