import { Text } from "@/components/ui/Text";
import { SparkleIcon } from "@/constants/Icons";
import {
  getImportButtonLabel,
  getImportStateKey,
  parseAssistantContent,
  parseStructuredListItems,
} from "@/utils/aiChatImportUtils";
import type { ChatMessage, ImportKind } from "@/utils/aiChatTypes";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

function renderInlineFormatting(text: string) {
  const parts: Array<string | React.JSX.Element> = [];
  const boldRegex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIndex = 0;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    parts.push(
      <Text
        key={`bold-${match.index}-${keyIndex++}`}
        className="font-semibold text-leben-text-2"
      >
        {match[1]}
      </Text>,
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

function renderAssistantMessage(message: string) {
  return parseAssistantContent(message).map((block, index) =>
    block.type === "list" ? (
      <View key={`list-${index}`} className="ml-4 space-y-1 mt-2">
        {block.content.map((item: string, itemIndex: number) => (
          <View key={`item-${index}-${itemIndex}`} className="flex-row">
            <Text className="text-leben-text-2 text-[14px] mr-2">•</Text>
            <Text className="text-leben-text-2 text-[14px] leading-relaxed flex-1">
              {renderInlineFormatting(item)}
            </Text>
          </View>
        ))}
      </View>
    ) : (
      <Text
        key={`para-${index}`}
        className="text-leben-text-2 text-[14px] leading-relaxed mt-2"
      >
        {block.content.map((line: string, lineIndex: number) => (
          <React.Fragment key={`line-${index}-${lineIndex}`}>
            {renderInlineFormatting(line)}
          </React.Fragment>
        ))}
      </Text>
    ),
  );
}

type Props = {
  messages: ChatMessage[];
  isThinking: boolean;
  importedMessageIds: Record<string, boolean>;
  onImport: (messageId: string, content: string) => void;
  scrollViewRef: React.RefObject<ScrollView | null>;
};

export default function AIChatMessages({
  messages,
  isThinking,
  importedMessageIds,
  onImport,
  scrollViewRef,
}: Props) {
  return (
    <ScrollView
      ref={scrollViewRef}
      className="flex-1 px-4 py-6"
      contentContainerStyle={{ paddingBottom: 24, gap: 24 }}
      onContentSizeChange={() =>
        scrollViewRef.current?.scrollToEnd({ animated: true })
      }
    >
      {messages.map((msg) => {
        const items =
          msg.role === "assistant" ? parseStructuredListItems(msg.content) : [];
        const counts = items.reduce(
          (acc, item) => {
            acc[item.kind] = (acc[item.kind] ?? 0) + 1;
            return acc;
          },
          {} as Partial<Record<ImportKind, number>>,
        );
        const importKey = getImportStateKey(msg.id);
        const isImported = Boolean(importedMessageIds[importKey]);

        return (
          <View
            key={msg.id}
            className={`flex-row gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <View
                className="items-center justify-center rounded-xl mt-1 flex-shrink-0 bg-leben-border border border-leben-border"
                style={{
                  width: 32,
                  height: 32,
                }}
              >
                <SparkleIcon color="#fff" />
              </View>
            )}

            <View
              className={`max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"}`}
            >
              {msg.role === "assistant" ? (
                <View className="rounded-2xl px-5 py-4 bg-leben-bg-card border border-leben-border">
                  <View>{renderAssistantMessage(msg.content)}</View>

                  {items.length > 0 && (
                    <TouchableOpacity
                      onPress={() => onImport(msg.id, msg.content)}
                      disabled={isImported}
                      className={`self-start rounded-lg px-3 py-2 mt-4 border ${
                        isImported
                          ? "bg-leben-border border-leben-border-subtle"
                          : "bg-leben-accent-dim border-leben-accent/60"
                      }`}
                    >
                      <Text
                        className={`text-[11px] font-semibold ${
                          isImported
                            ? "text-leben-text-muted"
                            : "text-leben-text"
                        }`}
                      >
                        {getImportButtonLabel(counts, isImported)}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View className="rounded-2xl px-5 py-4 bg-leben-bg-card border border-leben-border">
                  <Text className="text-leben-text text-[14px] leading-relaxed">
                    {msg.content}
                  </Text>
                  <Text className="text-[10px] text-leben-text-2 mt-2 font-semibold text-right">
                    YOU | {msg.time}
                  </Text>
                </View>
              )}
            </View>
          </View>
        );
      })}

      {isThinking && (
        <View className="flex-row gap-3">
          <View
            className="items-center justify-center rounded-xl mt-1 flex-shrink-0 bg-leben-accent-dim border border-leben-accent/30"
            style={{
              width: 32,
              height: 32,
            }}
          >
            <ActivityIndicator size="small" color="#555" />
          </View>
          <View className="rounded-2xl px-5 py-4 justify-center bg-leben-bg-card border border-leben-border">
            <Text className="text-[12px] text-leben-text-2 font-medium italic">
              Neural engine processing...
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
