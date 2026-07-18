import { BOOK_COLORS } from "@/constants/habits";
import type { BookFormData } from "@/store/bookSlice";
import { useState } from "react";
import { ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { BottomSheet } from "@/components/ui/BottomSheet";
import ReminderPicker from "@/components/shared/ReminderPicker";
import { Text } from '@/components/ui/Text';


interface AddBookModalProps {
  visible: boolean;
  onAdd: (b: BookFormData) => void;
  onClose: () => void;
}

export default function AddBookModal({
  visible,
  onAdd,
  onClose,
}: AddBookModalProps) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [totalPages, setTotalPages] = useState("");
  const [color, setColor] = useState(BOOK_COLORS[0]);
  const [showReminder, setShowReminder] = useState(false);
  const [reminderAt, setReminderAt] = useState<string | undefined>();

  const handleAdd = () => {
    if (!title.trim() || !totalPages) return;
    onAdd({
      title: title.trim(),
      author: author.trim() || "Unknown Author",
      totalPages: parseInt(totalPages),
      coverColor: color,
      reminderAt,
    });
    // Reset form
    setTitle("");
    setAuthor("");
    setTotalPages("");
    setColor(BOOK_COLORS[0]);
    onClose();
  };

  const handleCancel = () => {
    // Reset form
    setTitle("");
    setAuthor("");
    setTotalPages("");
    setColor(BOOK_COLORS[0]);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={handleCancel}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between mb-6">
          <Text
            className="font-black text-white text-[20px]"
            style={{ letterSpacing: -0.4 }}
          >
            Track a Book
          </Text>
        </View>

        <View className="flex-row gap-3 mb-6">
          {BOOK_COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setColor(c)}
              className="rounded-full"
              style={{
                width: 32,
                height: 32,
                backgroundColor: c,
                borderWidth: color === c ? 2 : 0,
                borderColor: "#fff",
              }}
            />
          ))}
        </View>

        <View>
          <Text
            style={{
              fontSize: 10,
              color: "#555",
              letterSpacing: 1,
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Book Title
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Atomic Habits"
            placeholderTextColor="#555"
            className="w-full rounded-xl px-4 py-3 text-white mb-5"
            style={{
              backgroundColor: "#161616",
              borderWidth: 1,
              borderColor: "#2a2a2a",
              fontSize: 14,
            }}
          />
        </View>

        <View>
          <Text
            style={{
              fontSize: 10,
              color: "#555",
              letterSpacing: 1,
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Author
          </Text>
          <TextInput
            value={author}
            onChangeText={setAuthor}
            placeholder="e.g. James Clear"
            placeholderTextColor="#555"
            className="w-full rounded-xl px-4 py-3 text-white mb-5"
            style={{
              backgroundColor: "#161616",
              borderWidth: 1,
              borderColor: "#2a2a2a",
              fontSize: 14,
            }}
          />
        </View>

        <View>
          <Text
            style={{
              fontSize: 10,
              color: "#555",
              letterSpacing: 1,
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Total Pages
          </Text>
          <TextInput
            value={totalPages}
            onChangeText={setTotalPages}
            placeholder="e.g. 320"
            placeholderTextColor="#555"
            keyboardType="numeric"
            className="w-full rounded-xl px-4 py-3 text-white mb-5"
            style={{
              backgroundColor: "#161616",
              borderWidth: 1,
              borderColor: "#2a2a2a",
              fontSize: 14,
            }}
          />
          {/* Buttons */}
          <View className="flex-row items-center justify-between mt-4">
            <TouchableOpacity onPress={() => setShowReminder(true)} className="flex-row items-center gap-1.5 p-2 bg-leben-bg-secondary rounded-lg border border-leben-border">
              <Text className="text-leben-text-muted text-[12px]">{reminderAt ? new Date(reminderAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Add Reminder"}</Text>
            </TouchableOpacity>

            <View className="flex-row gap-3 flex-1 ml-3">
              <TouchableOpacity
                onPress={handleCancel}
                className="flex-1 py-3 rounded-xl items-center justify-center"
                style={{
                  backgroundColor: "#161616",
                  borderWidth: 1,
                  borderColor: "#2a2a2a",
                }}
              >
                <Text style={{ color: "#888", fontSize: 13, fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAdd}
                disabled={!title.trim() || !totalPages}
                className="flex-1 py-3 rounded-xl items-center justify-center"
                style={{
                  backgroundColor: title.trim() && totalPages ? "#f0f0f0" : "#2a2a2a",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                  className={title.trim() && totalPages ? "text-leben-bg" : "text-leben-text-muted"}
                >
                  Add Book
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {showReminder && (
        <View style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
          <ReminderPicker
            initialValue={reminderAt}
            onSave={(val) => { setReminderAt(val); setShowReminder(false); }}
            onClose={() => setShowReminder(false)}
          />
        </View>
      )}
    </BottomSheet>
  );
}
