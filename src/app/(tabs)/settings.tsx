import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { useLebenStore } from '@/store/useStore';
import { ScreenLayout } from '@/components/shared/ScreenLayout';

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <TouchableOpacity
      onPress={onChange}
      activeOpacity={0.8}
      style={{
        width: 42,
        height: 24,
        backgroundColor: on ? '#7c6af0' : '#2a2a2a',
        borderRadius: 12,
        padding: 2,
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: '#fff',
          transform: [{ translateX: on ? 18 : 0 }],
        }}
      />
    </TouchableOpacity>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <Text
      style={{
        fontSize: 10,
        color: '#3a3a3a',
        letterSpacing: 1.6,
        textTransform: 'uppercase',
        marginBottom: 16,
        marginTop: 32,
      }}
    >
      {text}
    </Text>
  );
}

export default function SettingsScreen() {
  const [notifs, setNotifs] = useState({
    email: false,
    push: false,
  });

  const userId = useLebenStore((s) => s.userId);
  const userFullName = useLebenStore((s: any) => s.userFullName);
  const userEmail = useLebenStore((s: any) => s.userEmail);
  const purgeAll = useLebenStore((s: any) => s.purgeAll);

  const handlePushToggle = () => {
    // In a full mobile implementation, this would request expo-notifications permissions
    if (notifs.push) {
      setNotifs((p) => ({ ...p, push: false }));
    } else {
      Alert.alert(
        'Push Notifications',
        'This would request system notification permissions.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Enable', onPress: () => setNotifs((p) => ({ ...p, push: true })) },
        ]
      );
    }
  };

  const handlePurge = () => {
    Alert.alert(
      'CRITICAL WARNING',
      'This will permanently delete all tasks, habits, goals, and books from the server. This action is irreversible.\n\nAre you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Purge Core', 
          style: 'destructive',
          onPress: async () => {
            await purgeAll();
            Alert.alert('Workspace has been purged.');
          }
        },
      ]
    );
  };

  const displayName = userFullName || 'Leben User';
  const displayEmail = userEmail || '---';

  return (
    <ScreenLayout scrollable>
      <View className="flex-1 px-4 md:px-10 py-6 md:py-8" style={{ backgroundColor: '#0a0a0a' }}>
        
        {/* Profile section */}
        <View className="flex-row items-start gap-6 mb-8">
          {/* Avatar */}
          <View className="relative">
            <View
              className="rounded-2xl overflow-hidden items-center justify-center"
              style={{
                width: 88,
                height: 88,
                backgroundColor: '#1a1a1a',
                borderColor: '#2a2a2a',
                borderWidth: 1,
              }}
            >
              {/* Web uses a gradient + SVG. We'll simulate it with a View and Emoji */}
              <View
                className="w-full h-full items-center justify-center"
                style={{ backgroundColor: '#1f1f2e' }}
              >
                <Text style={{ fontSize: 40 }}>👤</Text>
              </View>
            </View>
            <TouchableOpacity
              className="absolute bottom-1.5 right-1.5 items-center justify-center rounded-full"
              style={{
                width: 26,
                height: 26,
                backgroundColor: '#1e1e1e',
                borderColor: '#333',
                borderWidth: 1,
              }}
            >
              <Text style={{ fontSize: 12, color: '#888' }}>✏️</Text>
            </TouchableOpacity>
          </View>

          {/* Name / badge */}
          <View className="justify-center mt-2">
            <Text
              className="font-black text-white capitalize"
              style={{ fontSize: 26, letterSpacing: -0.5, marginBottom: 4 }}
            >
              {userId ? displayName : 'Guest'}
            </Text>
            <Text style={{ fontSize: 13, color: '#555' }}>{displayEmail}</Text>
          </View>
        </View>

        {/* Display name + Workspace ID */}
        <View className="flex-row flex-wrap gap-4 mb-4">
          {[
            { label: 'DISPLAY NAME', val: displayName },
            {
              label: 'WORKSPACE ID',
              val: userId ? `OS-${userId.substring(0, 8).toUpperCase()}` : '--',
            },
          ].map(({ label, val }) => (
            <View
              key={label}
              className="rounded-xl p-4 flex-1 min-w-[150px]"
              style={{ backgroundColor: '#111', borderColor: '#1e1e1e', borderWidth: 1 }}
            >
              <Text
                style={{
                  fontSize: 9,
                  color: '#555',
                  letterSpacing: 1.4,
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                {label}
              </Text>
              <Text
                className="font-medium text-white capitalize"
                style={{ fontSize: 15 }}
              >
                {val}
              </Text>
            </View>
          ))}
        </View>

        {/* Notification Channels */}
        <SectionLabel text="System Preferences" />
        <View
          className="rounded-xl p-5 mb-8"
          style={{ backgroundColor: '#111', borderColor: '#1e1e1e', borderWidth: 1 }}
        >
          <View className="flex-row items-center gap-3 mb-4">
            <View
              className="items-center justify-center rounded-lg"
              style={{
                width: 34,
                height: 34,
                backgroundColor: '#1a1a1a',
                borderColor: '#222',
                borderWidth: 1,
              }}
            >
              <Text style={{ fontSize: 16 }}>🔔</Text>
            </View>
            <View>
              <Text className="font-medium text-white" style={{ fontSize: 14 }}>
                Notification Channels
              </Text>
              <Text style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
                Manage how Leben communicates vital updates
              </Text>
            </View>
          </View>

          <View className="flex-col gap-6 mt-4">
            <View className="flex-row items-center justify-between">
              <Text style={{ fontSize: 14, color: '#aaa' }}>Email Reminders</Text>
              <Toggle
                on={notifs.email}
                onChange={() => setNotifs((p) => ({ ...p, email: !p.email }))}
              />
            </View>
            <View className="flex-row items-center justify-between">
              <Text style={{ fontSize: 14, color: '#aaa' }}>Desktop / Mobile Push</Text>
              <Toggle on={notifs.push} onChange={handlePushToggle} />
            </View>
          </View>
        </View>

        {/* Danger zone */}
        <View
          className="rounded-xl p-5 mt-4"
          style={{ backgroundColor: '#110a0a', borderColor: '#2a1515', borderWidth: 1 }}
        >
          <View className="mb-4">
            <Text className="font-bold mb-1" style={{ fontSize: 15, color: '#e85555' }}>
              Workspace Termination
            </Text>
            <Text style={{ fontSize: 12, color: '#666', lineHeight: 18 }}>
              Permanently delete all tasks, habits, goals, and books spanning your workspace. This action is irreversible.
            </Text>
          </View>
          <TouchableOpacity
            onPress={handlePurge}
            className="items-center justify-center rounded-xl active:opacity-80"
            style={{
              backgroundColor: '#e85555',
              paddingVertical: 12,
              paddingHorizontal: 20,
              alignSelf: 'flex-start',
            }}
          >
            <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>
              Purge Core
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View
          className="flex-row items-center justify-between mt-8 pt-4 mb-10"
          style={{ borderTopColor: '#161616', borderTopWidth: 1 }}
        >
          <Text style={{ fontSize: 10, color: '#2a2a2a', letterSpacing: 1 }}>
            Leben V1.0
          </Text>
        </View>
      </View>
    </ScreenLayout>
  );
}
