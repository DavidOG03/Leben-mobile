import { Text } from "@/components/ui/Text";
import { SparkleIcon, TrashIcon } from "@/constants/Icons";
import {
  getImportButtonLabel,
  getImportStateKey,
  parseAssistantContent,
  parseStructuredListItems,
} from "@/utils/aiChatImportUtils";
import type { ChatMessage, ImportKind } from "@/utils/aiChatTypes";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

/** Pulsing sparkle shown inside the AI "thinking" bubble */
function PulsingSparkle() {
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0.75,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.75,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity, scale]);

  return (
    <Animated.View style={{ opacity, transform: [{ scale }] }}>
      <SparkleIcon color="#6b7fff" size={16} />
    </Animated.View>
  );
}

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
        className="font-geist-semibold text-leben-text-2"
        selectable={true}
      >
        {match[1]}
      </Text>,
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

function renderAssistantMessage(
  msgId: string,
  message: string,
  importedMessageIds: Record<string, boolean>,
  onImportItem: (msgId: string, itemIndex: string | number, item: any) => void
) {
  return parseAssistantContent(message).map((block, index) => {
    // ── Heading ───────────────────────────────────────────────────────────────
    if (block.type === "heading") {
      const fontSize =
        block.headingLevel === 1 ? 22 : block.headingLevel === 2 ? 20 : 18;
      return (
        <Text
          key={`heading-${index}`}
          className="font-geist-bold text-leben-text mt-3 mb-0.5"
          style={{ fontSize }}
          selectable={true}
        >
          {renderInlineFormatting(block.content)}
        </Text>
      );
    }

    // ── List (tasks, habits, goals, books) ────────────────────────────────────
    if (block.type === "list") {
      return (
        <View key={`list-${index}`} className="gap-1.5 mt-2">
          {block.items.map((item, itemIndex) => {
            const itemKey = `${index}-${itemIndex}`;
            const importKey = `${msgId}-${itemKey}`;
            const isImported = Boolean(importedMessageIds[importKey]);

            // Each kind gets a distinct bullet glyph and accent colour
            const config =
              item.kind === "task"
                ? { bullet: "—", color: "#6b7fff", label: "Add Task" }
                : item.kind === "habit"
                  ? { bullet: "+", color: "#4caf7d", label: "Track Habit" }
                  : item.kind === "goal"
                    ? { bullet: "›", color: "#e8a855", label: "Set Goal" }
                    : item.kind === "book"
                      ? { bullet: "~", color: "#a78bfa", label: "Read Book" }
                      : { bullet: item.bullet || "•", color: "#888", label: "" };

            return (
              <View key={`item-${index}-${itemIndex}`}>
                <View className="flex-row items-start mb-1">
                  <Text
                    style={{
                      color: config.color,
                      fontSize: 14,
                      marginRight: 8,
                      fontWeight: "700",
                      marginTop: 1,
                      minWidth: 12,
                    }}
                    selectable={true}
                  >
                    {config.bullet}
                  </Text>
                  <View className="flex-1">
                    <Text className="text-leben-text-2 text-[14px] leading-relaxed" selectable={true}>
                      {renderInlineFormatting(item.text)}
                    </Text>
                    {/* Milestone sub-items for goals */}
                    {item.milestones && item.milestones.length > 0 && (
                      <View className="mt-1 ml-1 gap-0.5">
                        {item.milestones.map((ms, mi) => (
                          <Text
                            key={`ms-${index}-${itemIndex}-${mi}`}
                            className="text-leben-text-muted text-[11px] leading-snug"
                            selectable={true}
                          >
                            ◦ {ms}
                          </Text>
                        ))}
                      </View>
                    )}
                    {/* Individual Import Button */}
                    {item.kind !== "unknown" && (
                      <TouchableOpacity
                        onPress={() => onImportItem(msgId, itemKey, item)}
                        disabled={isImported}
                        className={`self-start rounded-lg px-2.5 py-1.5 mt-2 mb-1 border ${
                          isImported
                            ? "bg-leben-border border-leben-border-subtle"
                            : "bg-leben-accent-dim border-leben-accent/60"
                        }`}
                      >
                        <Text
                          className={`text-[10px] font-geist-semibold ${
                            isImported
                              ? "text-leben-text-muted"
                              : "text-leben-text"
                          }`}
                        >
                          {isImported ? "Imported" : config.label}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      );
    }

    // ── Paragraph ─────────────────────────────────────────────────────────────
    return (
      <Text
        key={`para-${index}`}
        className="text-leben-text-2 text-[14px] leading-relaxed mt-2"
        selectable={true}
      >
        {block.content.map((line: string, lineIndex: number) => (
          <React.Fragment key={`line-${index}-${lineIndex}`}>
            {lineIndex > 0 ? "\n" : ""}
            {renderInlineFormatting(line)}
          </React.Fragment>
        ))}
      </Text>
    );
  });
}

type Props = {
  messages: ChatMessage[];
  isThinking: boolean;
  thinkingStatus: string;
  importedMessageIds: Record<string, boolean>;
  onImport: (msgId: string, itemIndex: string | number, item: any) => void;
  scrollViewRef: React.RefObject<ScrollView | null>;
  errorState?: { failedPrompt: string; errorMessage: string } | null;
  retryRequest?: () => void;
  onDeleteMessage?: (id: string) => void;
};

export default function AIChatMessages({
  messages,
  isThinking,
  thinkingStatus,
  importedMessageIds,
  onImport,
  scrollViewRef,
  errorState,
  retryRequest,
  onDeleteMessage,
}: Props) {
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

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
        return (
          <View
            key={msg.id}
            className={`flex-row gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <View
                className="items-center justify-center rounded-xl mt-1 flex-shrink-0 bg-leben-accent border border-leben-accent-75"
                style={{
                  width: 32,
                  height: 32,
                }}
              >
                <SparkleIcon color="#fff" />
              </View>
            )}

            {msg.role === "user" && selectedMessageId === msg.id && (
              <TouchableOpacity
                onPress={() => {
                  setSelectedMessageId(null);
                  if (onDeleteMessage) {
                    Alert.alert("Delete Message", "Are you sure you want to delete this message?", [
                      { text: "Cancel", style: "cancel" },
                      { text: "Delete", style: "destructive", onPress: () => onDeleteMessage(msg.id) },
                    ]);
                  }
                }}
                className="items-center justify-center bg-red-500/10 border border-red-500/30 rounded-full w-8 h-8 self-center"
              >
                <TrashIcon color="#ef4444" size={14} />
              </TouchableOpacity>
            )}

            <View
              className={`max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"}`}
            >
              {msg.role === "assistant" ? (
                <View className="rounded-2xl px-5 py-4 bg-leben-bg-card border border-leben-border-subtle">
                  <View>
                    {renderAssistantMessage(
                      msg.id,
                      msg.content,
                      importedMessageIds,
                      onImport
                    )}
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setSelectedMessageId(selectedMessageId === msg.id ? null : msg.id)}
                  activeOpacity={0.8}
                  className="rounded-2xl px-5 py-4 bg-leben-accent-dim border border-leben-accent-75"
                >
                  <Text className="text-leben-text text-[14px] leading-relaxed" selectable={true}>
                    {msg.content}
                  </Text>
                  <Text className="text-[10px] text-leben-text-2 mt-2 font-geist-semibold text-right">
                    {msg.time}
                  </Text>
                </TouchableOpacity>
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
            <PulsingSparkle />
          </View>
          <View className="rounded-2xl px-5 py-4 justify-center bg-leben-bg-card border border-leben-border">
            <Text className="text-leben-text-muted text-[13px] font-geist-medium">
              {thinkingStatus}
            </Text>
          </View>
        </View>
      )}

      {errorState && (
        <View className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex-row items-center justify-between mt-2">
          <Text className="text-red-400 text-[13px] flex-1 mr-2">
            {errorState.errorMessage}
          </Text>
          {retryRequest && (
            <TouchableOpacity
              onPress={retryRequest}
              className="bg-red-500/20 px-3 py-1.5 rounded-lg border border-red-500/30"
            >
              <Text className="text-red-400 text-[12px] font-geist-medium">
                Retry
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
}
