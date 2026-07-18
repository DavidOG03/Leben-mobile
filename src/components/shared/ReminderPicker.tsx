import { SparkleIcon } from "@/constants/Icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { , TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/Text';


interface ReminderPickerProps {
  initialValue?: string; // ISO string
  onSave: (isoDate: string | undefined) => void;
  onClose: () => void;
}

export default function ReminderPicker({
  initialValue,
  onSave,
  onClose,
}: ReminderPickerProps) {
  const defaultDate = initialValue ? new Date(initialValue) : new Date();

  const [date, setDate] = useState<Date>(defaultDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSave = () => {
    onSave(date.toISOString());
  };

  const handleClear = () => {
    onSave(undefined);
  };

  return (
    <View
      className="p-4 rounded-xl z-9999 bg-leben-bg-card border border-leben-border"
      style={{ zIndex: 9999, elevation: 9999 }}
    >
      <View className="flex-row items-center gap-2 mb-4">
        <SparkleIcon />
        <Text className="text-white font-bold text-[14px]">Set Reminder</Text>
      </View>

      <View className="gap-3 mb-4">
        <View className="gap-1.5">
          <Text className="text-leben-text-dim text-[10px] uppercase tracking-wider">
            Date
          </Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="w-full bg-leben-bg-secondary border border-leben-border rounded-lg px-3 py-3"
          >
            <Text className="text-white text-[13px]">
              {date.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="gap-1.5">
          <Text className="text-leben-text-dim text-[10px] uppercase tracking-wider">
            Time
          </Text>
          <TouchableOpacity
            onPress={() => setShowTimePicker(true)}
            className="w-full bg-leben-bg-secondary border border-leben-border rounded-lg px-3 py-3"
          >
            <Text className="text-white text-[13px]">
              {date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={date}
          mode="time"
          display="default"
          onChange={(event, selectedDate) => {
            setShowTimePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      <View className="flex-row items-center justify-between mt-5">
        <TouchableOpacity
          onPress={handleClear}
          className="px-4 py-2 rounded-lg"
        >
          <Text className="text-leben-text-muted text-[12px]">Remove</Text>
        </TouchableOpacity>

        <View className="flex-row items-center gap-2">
          <TouchableOpacity onPress={onClose} className="px-4 py-2 rounded-lg">
            <Text className="text-leben-text-muted text-[12px]">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
            className="px-5 py-2 rounded-lg bg-leben-accent"
            style={{
              shadowColor: "rgba(124,106,240,0.3)",
              shadowOpacity: 1,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
            }}
          >
            <Text className="text-white font-bold text-[12px]">
              Save Reminder
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
