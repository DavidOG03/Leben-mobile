import { Text } from "@/components/ui/Text";
import { SparkleIcon } from "@/constants/Icons";
import {
  getImportButtonLabel,
  getImportStateKey,
  parseAssistantContent,
  parseStructuredListItems,
} from "@/utils/aiChatImportUtils";
import type { ChatMessage, ImportKind } from "@/utils/aiChatTypes";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
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
  return parseAssistantContent(message).map((block, index) => {
    // ── Heading ───────────────────────────────────────────────────────────────
    if (block.type === "heading") {
      const fontSize =
        block.headingLevel === 1 ? 22 :
        block.headingLevel === 2 ? 20 : 18;
      return (
        <Text
          key={`heading-${index}`}
          className="font-geist-bold text-leben-text mt-3 mb-0.5"
          style={{ fontSize }}
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
            // Each kind gets a distinct bullet glyph and accent colour
            const config =
              item.kind === "task"  ? { bullet: "—", color: "#6b7fff" } :
              item.kind === "habit" ? { bullet: "+", color: "#4caf7d" } :
              item.kind === "goal"  ? { bullet: "›", color: "#e8a855" } :
              item.kind === "book"  ? { bullet: "~", color: "#a78bfa" } :
                                     { bullet: "•", color: "#888"    };

            return (
              <View key={`item-${index}-${itemIndex}`}>
                <View className="flex-row items-start">
                  <Text
                    style={{
                      color: config.color,
                      fontSize: 14,
                      marginRight: 8,
                      fontWeight: "700",
                      marginTop: 1,
                      minWidth: 12,
                    }}
                  >
                    {config.bullet}
                  </Text>
                  <View className="flex-1">
                    <Text className="text-leben-text-2 text-[14px] leading-relaxed">
                      {renderInlineFormatting(item.text)}
                    </Text>
                    {/* Milestone sub-items for goals */}
                    {item.milestones && item.milestones.length > 0 && (
                      <View className="mt-1 ml-1 gap-0.5">
                        {item.milestones.map((ms, mi) => (
                          <Text
                            key={`ms-${index}-${itemIndex}-${mi}`}
                            className="text-leben-text-muted text-[11px] leading-snug"
                          >
                            ◦ {ms}
                          </Text>
                        ))}
                      </View>
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
      >
        {block.content.map((line: string, lineIndex: number) => (
          <React.Fragment key={`line-${index}-${lineIndex}`}>
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
                className="items-center justify-center rounded-xl mt-1 flex-shrink-0 bg-leben-accent border border-leben-accent-75"
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
                        className={`text-[11px] font-geist-semibold ${
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
                  <Text className="text-[10px] text-leben-text-2 mt-2 font-geist-semibold text-right">
                    {msg.time}
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
            <PulsingSparkle />
          </View>
        </View>
      )}
    </ScrollView>
  );
}
