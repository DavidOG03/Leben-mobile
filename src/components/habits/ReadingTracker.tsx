import { PlusIcon } from "@/constants/Icons";
import type { Book } from "@/store/bookSlice";
import React from "react";
import { ScrollView, TouchableOpacity, View } from 'react-native';
import BookCard from "./BookCard";
import { Text } from '@/components/ui/Text';


interface ReadingTrackerProps {
  onShowAddBook: (show: boolean) => void;
  books: Book[];
}

const GhostBookCard = ({ opacity }: { opacity: number }) => (
  <View
    className="rounded-xl flex-1 mr-4 bg-leben-bg-card border border-leben-border"
    style={{
      opacity,
      height: 140,
      width: 140,
    }}
  >
    <View className="p-4 flex-col justify-between h-full">
      <View className="rounded-lg w-8 h-8 mb-3 bg-leben-border" />
      <View>
        <View className="h-3 rounded-full w-3/4 mb-2 bg-leben-border" />
        <View className="h-2 rounded-full w-1/2 bg-leben-bg-element" />
      </View>
    </View>
  </View>
);

const ReadingTracker: React.FC<ReadingTrackerProps> = ({
  onShowAddBook,
  books,
}) => {
  return (
    <View className="mb-6 px-4 md:px-0">
      <View className="flex-row items-center justify-between mb-4 flex-wrap">
        <View>
          <Text
            className="font-bold text-white"
            style={{ fontSize: 18, letterSpacing: -0.5 }}
          >
            Reading Tracker
          </Text>
          <Text className="text-xs text-leben-text-muted my-2">
            Track every book you're working through.
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => onShowAddBook(true)}
          className="flex-row items-center gap-1.5 px-3 py-2 rounded-lg bg-leben-bg-element border border-leben-border-subtle"
        >
          <PlusIcon color="#555555" size={11} />
          <Text className="text-leben-text-2 text-[12px] font-bold">
            Add Book
          </Text>
        </TouchableOpacity>
      </View>

      {books.length === 0 ? (
        <View className="rounded-2xl overflow-hidden border border-leben-border bg-leben-bg-secondary">
          <View className="p-4 flex-row">
            {[1, 0.65].map((op, i) => (
              <GhostBookCard key={i} opacity={op} />
            ))}
          </View>
          <View className="flex-col items-center justify-center py-8 gap-3 border-t border-leben-border">
            <Text className="text-[28px]">📚</Text>
            <Text className="font-medium text-[13px] text-leben-text-muted">
              No books tracked yet
            </Text>
            <Text className="text-[12px] text-leben-text-dim text-center leading-[18px]">
              Click "Add Book" above{"\n"}to start tracking your reading.
            </Text>
          </View>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="-mx-4 px-4"
        >
          <View className="flex-row gap-4 pr-8">
            {books.map((book: Book) => (
              <View key={book.id} style={{ width: 220 }}>
                <BookCard book={book} />
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default ReadingTracker;
