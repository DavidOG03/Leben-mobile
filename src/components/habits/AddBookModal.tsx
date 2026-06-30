import { BOOK_COLORS } from "@/constants/habits";
import type { BookFormData } from "@/store/bookSlice";
import { useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

  const handleAdd = () => {
    if (!title.trim() || !totalPages) return;
    onAdd({
      title: title.trim(),
      author: author.trim() || "Unknown Author",
      totalPages: parseInt(totalPages),
      coverColor: color,
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
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <SafeAreaView className="flex-1" style={{ backgroundColor: "#0a0a0a" }}>
        <View className="flex-1 px-5 pt-4">
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
              className="w-full rounded-xl px-4 py-3 text-white mb-8"
              style={{
                backgroundColor: "#161616",
                borderWidth: 1,
                borderColor: "#2a2a2a",
                fontSize: 14,
              }}
            />
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleCancel}
              className="flex-1 rounded-xl py-3 items-center justify-center"
              style={{
                backgroundColor: "#161616",
                borderWidth: 1,
                borderColor: "#2a2a2a",
              }}
            >
              <Text style={{ color: "#888", fontSize: 13, fontWeight: "600" }}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAdd}
              className="flex-1 rounded-xl py-3 items-center justify-center"
              style={{
                backgroundColor:
                  title.trim() && totalPages ? "#f0f0f0" : "#2a2a2a",
              }}
            >
              <Text
                style={{
                  color: title.trim() && totalPages ? "#0a0a0a" : "#555",
                  fontSize: 13,
                  fontWeight: "600",
                }}
              >
                Add Book
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
