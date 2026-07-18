import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput } from 'react-native';
import { useLebenStore } from '@/store/useStore';
import type { Book } from '@/store/bookSlice';
import { Text } from '@/components/ui/Text';


interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  const updateBook = useLebenStore((s: any) => s.updateBook);
  const removeBook = useLebenStore((s: any) => s.removeBook);

  const [editingProgress, setEditingProgress] = useState(false);
  const [pageInput, setPageInput] = useState(String(book.currentPage));

  const [editingDetails, setEditingDetails] = useState(false);
  const [editTitle, setEditTitle] = useState(book.title);
  const [editAuthor, setEditAuthor] = useState(book.author);

  const pct = Math.min(
    100,
    book.totalPages > 0 ? Math.round((book.currentPage / book.totalPages) * 100) : 0,
  );
  const pagesLeft = book.totalPages > 0 ? book.totalPages - book.currentPage : 0;

  const handleSaveProgress = () => {
    const p = Math.min(book.totalPages > 0 ? book.totalPages : 9999, Math.max(0, parseInt(pageInput) || 0));
    updateBook(book.id, { currentPage: p });
    setPageInput(String(p));
    setEditingProgress(false);
  };

  const handleSaveDetails = () => {
    updateBook(book.id, { title: editTitle, author: editAuthor });
    setEditingDetails(false);
  };

  return (
    <View
      className="rounded-2xl p-5"
      style={{ backgroundColor: 'var(--bg-card)', borderWidth: 1, borderColor: 'var(--border-primary)' }}
    >
      <View className="flex-row items-start justify-between mb-4">
        <View
          className="items-center justify-center rounded-xl"
          style={{
            width: 44,
            height: 44,
            backgroundColor: `${book.coverColor}22`,
            borderWidth: 1,
            borderColor: `${book.coverColor}33`,
          }}
        >
          <Text style={{ fontSize: 24 }}>📖</Text>
        </View>
        <View className="flex-row items-center gap-4">
          <TouchableOpacity onPress={() => setEditingDetails(!editingDetails)}>
            <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => removeBook(book.id)}>
            <Text style={{ color: 'var(--text-dim)', fontSize: 20, lineHeight: 20 }}>×</Text>
          </TouchableOpacity>
        </View>
      </View>

      {editingDetails ? (
        <View className="flex-col gap-2 mb-3">
          <TextInput
            value={editTitle}
            onChangeText={setEditTitle}
            className="rounded-lg px-3 py-1.5 text-white"
            style={{ backgroundColor: 'var(--bg-secondary)', borderWidth: 1, borderColor: `${book.coverColor}55`, fontSize: 14 }}
            placeholder="Book Title"
            placeholderTextColor="#666"
            autoFocus
          />
          <TextInput
            value={editAuthor}
            onChangeText={setEditAuthor}
            className="rounded-lg px-3 py-1.5 text-white"
            style={{ backgroundColor: 'var(--bg-secondary)', borderWidth: 1, borderColor: `${book.coverColor}55`, fontSize: 11 }}
            placeholder="Author"
            placeholderTextColor="#666"
          />
          <TouchableOpacity
            onPress={handleSaveDetails}
            className="rounded-lg px-3 py-2 items-center mt-1"
            style={{ backgroundColor: book.coverColor }}
          >
            <Text style={{ color: 'var(--text-primary)', fontSize: 12, fontWeight: 'bold' }}>Save Details</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="mb-3">
          <Text
            className="font-bold text-white leading-tight mb-1"
            style={{ fontSize: 15 }}
          >
            {book.title}
          </Text>
          <Text style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            by {book.author}
          </Text>
        </View>
      )}

      <View
        className="rounded-full overflow-hidden mb-2"
        style={{ height: 4, backgroundColor: 'var(--border-primary)' }}
      >
        <View
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            backgroundColor: book.coverColor,
          }}
        />
      </View>

      <View className="flex-row items-center justify-between mb-4">
        <Text style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {pagesLeft > 0 ? `${pagesLeft} pages left` : 'Finished! 🎉'}
        </Text>
        <Text
          className="font-bold"
          style={{ fontSize: 13, color: book.coverColor }}
        >
          {pct}%
        </Text>
      </View>

      {editingProgress ? (
        <View className="flex-row gap-2">
          <TextInput
            value={pageInput}
            onChangeText={setPageInput}
            keyboardType="numeric"
            autoFocus
            className="flex-1 rounded-lg px-3 py-2 text-white"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderWidth: 1,
              borderColor: `${book.coverColor}55`,
              fontSize: 12,
            }}
            placeholder={`0 – ${book.totalPages}`}
            placeholderTextColor="#666"
          />
          <TouchableOpacity
            onPress={handleSaveProgress}
            className="rounded-lg px-3 py-2 items-center justify-center"
            style={{ backgroundColor: book.coverColor }}
          >
            <Text style={{ color: 'var(--text-primary)', fontSize: 12, fontWeight: 'bold' }}>Save</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => setEditingProgress(true)}
          className="w-full rounded-lg py-2 items-center"
          style={{
            backgroundColor: `${book.coverColor}18`,
            borderWidth: 1,
            borderColor: `${book.coverColor}33`,
          }}
        >
          <Text style={{ color: book.coverColor, fontSize: 12, fontWeight: 'bold' }}>
            Update Progress · p.{book.currentPage}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
