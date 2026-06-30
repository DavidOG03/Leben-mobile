import { View, Text, TouchableOpacity } from 'react-native';
import { useLebenStore, ScheduleItem } from '@/store/useStore';
import { useState } from 'react';
import { BellIcon } from '@/constants/Icons';
// import ReminderPicker from '../shared/ReminderPicker'; // You can add your modal/picker equivalent here

interface TimelineItemProps {
  item: ScheduleItem;
  isCurrent?: boolean;
}

export function TimelineItem({ item, isCurrent }: TimelineItemProps) {
  const toggleScheduleItem = useLebenStore((s) => s.toggleScheduleItem);
  const updateScheduleItem = useLebenStore((s) => s.updateScheduleItem);

  const isDeepWork = item.tag.toLowerCase().includes('work');
  const isRecharge = item.tag.toLowerCase().includes('health') || item.tag.toLowerCase().includes('mind');

  return (
    <View className="flex-row gap-4 mb-8">
      {/* Time label and dot */}
      <View className="flex-col items-center w-12 pt-1 pb-4">
        <Text
          className="text-[#555] font-bold"
          style={{ fontSize: 11 }}
        >
          {item.start}
        </Text>
        <View
          className="mt-3 relative z-10 items-center justify-center"
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: isCurrent ? '#7c6af0' : '#222',
            borderColor: isCurrent ? '#000' : '#333',
            borderWidth: isCurrent ? 2 : 1,
            shadowColor: isCurrent ? '#7c6af0' : 'transparent',
            shadowOpacity: isCurrent ? 0.8 : 0,
            shadowRadius: 5,
          }}
        >
          {item.reminderAt && (
            <View className="absolute top-4">
              <BellIcon color="#7c6af0" size={10} />
            </View>
          )}
        </View>
      </View>

      {/* Card */}
      <View
        className="flex-1 rounded-2xl p-5"
        style={{
          backgroundColor: isCurrent ? '#15151f' : '#111',
          borderColor: isCurrent ? 'rgba(124, 106, 240, 0.2)' : '#1a1a1a',
          borderWidth: 1,
        }}
      >
        <View className="flex-row items-start justify-between mb-4">
          <View className="flex-col gap-1 flex-1 pr-2">
            <View className="flex-row items-center gap-2">
              <View
                className="px-2 py-0.5 rounded"
                style={{
                  backgroundColor: isDeepWork ? '#1e1e2e' : isRecharge ? '#1e2e22' : '#1a1a1a',
                  borderColor: isDeepWork ? '#2a2a4a' : isRecharge ? '#2a4a33' : '#222',
                  borderWidth: 1,
                }}
              >
                <Text
                  className="font-bold uppercase tracking-widest"
                  style={{
                    fontSize: 9,
                    color: isDeepWork ? '#7c6af0' : isRecharge ? '#4caf70' : '#888',
                  }}
                >
                  {item.tag}
                </Text>
              </View>
              {item.reminderAt && (
                <View className="flex-row items-center gap-1">
                  <BellIcon color="currentColor" size={9} />
                  <Text style={{ color: '#7c6af0', fontSize: 9, fontWeight: 'bold' }}>Reminder set</Text>
                </View>
              )}
            </View>
            <Text
              className="text-white font-bold mt-1"
              style={{ fontSize: 18 }}
            >
              {item.title}
            </Text>
          </View>
          
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => toggleScheduleItem(item.id)}
              className="items-center justify-center rounded"
              style={{
                width: 20,
                height: 20,
                borderWidth: 1,
                borderColor: item.status === 'completed' ? '#7c6af0' : '#444',
                backgroundColor: item.status === 'completed' ? '#7c6af0' : 'transparent',
              }}
            >
              {item.status === 'completed' && (
                <View className="w-2 h-2 rounded-full bg-white" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <Text
          className="text-[#777] leading-relaxed"
          style={{ fontSize: 13 }}
        >
          {item.description}
        </Text>

        <View className="flex-row gap-2 mt-5">
          <View className="px-3 py-1 rounded-full bg-[#1a1a1a] border border-[#222]">
            <Text className="text-[#666] font-medium" style={{ fontSize: 10 }}>{item.tag}</Text>
          </View>
          <View className="px-3 py-1 rounded-full bg-[#1a1a1a] border border-[#222]">
            <Text className="text-[#666] font-medium" style={{ fontSize: 10 }}>{item.priority.toUpperCase()}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
