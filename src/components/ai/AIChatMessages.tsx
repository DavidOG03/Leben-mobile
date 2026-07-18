import React from 'react';
import { View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SparkleIcon } from '@/constants/Icons';
import {
  getImportStateKey,
  getImportButtonLabel,
  parseAssistantContent,
  parseStructuredListItems,
} from '@/utils/aiChatImportUtils';
import type { ChatMessage, ImportKind } from '@/utils/aiChatTypes';
import { Text } from '@/components/ui/Text';


function renderInlineFormatting(text: string) {
  const parts: Array<string | React.JSX.Element> = [];
  const boldRegex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIndex = 0;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    parts.push(
      <Text key={`bold-${match.index}-${keyIndex++}`} className="font-semibold text-white">
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
    block.type === 'list' ? (
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
      onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
    >
      {messages.map((msg) => {
        const items =
          msg.role === 'assistant' ? parseStructuredListItems(msg.content) : [];
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
            className={`flex-row gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <View
                className="items-center justify-center rounded-xl mt-1 flex-shrink-0"
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: '#2d2480',
                  borderWidth: 1,
                  borderColor: 'rgba(124,106,240,0.3)',
                }}
              >
                <SparkleIcon />
              </View>
            )}
            
            <View className={`max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              {msg.role === 'assistant' ? (
                <View
                  className="rounded-2xl px-5 py-4"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderWidth: 1,
                    borderColor: 'var(--border-primary)',
                  }}
                >
                  <View>
                    {renderAssistantMessage(msg.content)}
                  </View>
                  
                  {items.length > 0 && (
                    <TouchableOpacity
                      onPress={() => onImport(msg.id, msg.content)}
                      disabled={isImported}
                      className="self-start rounded-lg px-3 py-2 mt-4"
                      style={{
                        backgroundColor: isImported ? 'var(--border-primary)' : '#2d2480',
                        borderWidth: 1,
                        borderColor: isImported ? '#3a3a3a' : '#6258f2',
                      }}
                    >
                      <Text
                        style={{
                          color: isImported ? 'var(--text-muted)' : 'var(--text-primary)',
                          fontSize: 11,
                          fontWeight: '600',
                        }}
                      >
                        {getImportButtonLabel(counts, isImported)}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View
                  className="rounded-2xl px-5 py-4"
                  style={{
                    backgroundColor: '#1e1a41',
                    borderWidth: 1,
                    borderColor: 'rgba(124,106,240,0.2)',
                  }}
                >
                  <Text className="text-leben-text text-[14px] leading-relaxed">
                    {msg.content}
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      color: '#6358cc',
                      marginTop: 8,
                      fontWeight: '600',
                      textAlign: 'right',
                    }}
                  >
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
            className="items-center justify-center rounded-xl mt-1 flex-shrink-0"
            style={{
              width: 32,
              height: 32,
              backgroundColor: '#2d2480',
              borderWidth: 1,
              borderColor: 'rgba(124,106,240,0.3)',
            }}
          >
            <ActivityIndicator size="small" color="#fff" />
          </View>
          <View
            className="rounded-2xl px-5 py-4 justify-center"
            style={{ backgroundColor: 'var(--bg-card)', borderWidth: 1, borderColor: 'var(--border-primary)' }}
          >
            <Text className="text-[12px] text-leben-text-muted font-medium italic">
              Neural engine processing...
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
