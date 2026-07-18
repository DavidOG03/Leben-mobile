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
    className="rounded-xl flex-1 mr-4"
    style={{
      backgroundColor: "#111",
      borderWidth: 1,
      borderColor: "#1e1e1e",
      opacity,
      height: 140,
      width: 140,
    }}
  >
    <View className="p-4 flex-col justify-between h-full">
      <View
        className="rounded-lg w-8 h-8 mb-3"
        style={{ backgroundColor: "#222" }}
      />
      <View>
        <View
          className="h-3 rounded-full w-3/4 mb-2"
          style={{ backgroundColor: "#222" }}
        />
        <View
          className="h-2 rounded-full w-1/2"
          style={{ backgroundColor: "#1a1a1a" }}
        />
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
          className="flex-row items-center gap-1.5 px-3 py-2 rounded-lg"
          style={{
            backgroundColor: "#1a1a1a",
            borderWidth: 1,
            borderColor: "#2a2a2a",
          }}
        >
          <PlusIcon color="#ccc" size={11} />
          <Text style={{ color: "#ccc", fontSize: 12, fontWeight: "bold" }}>
            Add Book
          </Text>
        </TouchableOpacity>
      </View>

      {books.length === 0 ? (
        <View
          className="rounded-2xl overflow-hidden"
          style={{
            borderWidth: 1,
            borderColor: "#1e1e1e",
            backgroundColor: "#131313",
          }}
        >
          <View className="p-4 flex-row">
            {[1, 0.65].map((op, i) => (
              <GhostBookCard key={i} opacity={op} />
            ))}
          </View>
          <View
            className="flex-col items-center justify-center py-8 gap-3"
            style={{ borderTopWidth: 1, borderTopColor: "#181818" }}
          >
            <Text style={{ fontSize: 28 }}>📚</Text>
            <Text
              className="font-medium"
              style={{ fontSize: 13, color: "#aaa" }}
            >
              No books tracked yet
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: "#555",
                textAlign: "center",
                lineHeight: 18,
              }}
            >
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
