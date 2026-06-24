// components/shared/NeuralDropup.tsx
// Press "Neural ✦" tab → panel animates up showing Planner, AI Chat, Analytics
import { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Animated,
  TouchableWithoutFeedback, Pressable,
} from 'react-native';
import { useRouter }      from 'expo-router';
import { LC }             from '@/constants/theme';

interface SubLink {
  label:  string;
  icon:   string;
  href:   '/(tabs)/planner' | '/(tabs)/ai' | '/(tabs)/analytics';
  desc:   string;
}

const SUB_LINKS: SubLink[] = [
  { label: 'Daily Planner', icon: '✦', href: '/(tabs)/planner',   desc: 'AI-generated schedule' },
  { label: 'Neural Chat',   icon: '◈', href: '/(tabs)/ai',        desc: 'Ask your AI assistant' },
  { label: 'Analytics',     icon: '◉', href: '/(tabs)/analytics', desc: 'Productivity insights' },
];

interface NeuralDropupProps {
  visible:  boolean;
  onClose:  () => void;
  tabBarHeight: number;
}

export function NeuralDropup({ visible, onClose, tabBarHeight }: NeuralDropupProps) {
  const translateY = useRef(new Animated.Value(200)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const router     = useRouter();

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue:          0,
          tension:          80,
          friction:         10,
          useNativeDriver:  true,
        }),
        Animated.timing(opacity, {
          toValue:         1,
          duration:        180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue:         200,
          duration:        160,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue:         0,
          duration:        130,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={{ opacity }}
          className="absolute inset-0 bg-black/50"
          pointerEvents={visible ? 'auto' : 'none'}
        />
      </TouchableWithoutFeedback>

      {/* Panel */}
      <Animated.View
        style={{
          transform: [{ translateY }],
          bottom: tabBarHeight,
        }}
        className="absolute left-0 right-0 bg-leben-bg-card border-t border-leben-border rounded-t-3xl px-5 pt-5 pb-3"
      >
        {/* Handle */}
        <View className="w-10 h-1 bg-leben-border rounded-full self-center mb-4" />

        <Text className="text-leben-text-2 text-xs uppercase tracking-widest font-semibold mb-3 px-1">
          Neural ✦
        </Text>

        <View className="gap-2">
          {SUB_LINKS.map((link) => (
            <Pressable
              key={link.href}
              onPress={() => {
                onClose();
                router.push(link.href as any);
              }}
              className="flex-row items-center gap-4 px-3 py-4 rounded-2xl active:bg-leben-bg-secondary"
            >
              {/* Icon bubble */}
              <View className="w-11 h-11 rounded-xl bg-leben-accent-dim border border-[rgba(124,106,240,0.2)] items-center justify-center">
                <Text className="text-leben-accent text-lg">{link.icon}</Text>
              </View>
              {/* Text */}
              <View className="flex-1">
                <Text className="text-leben-text font-medium text-[15px]">
                  {link.label}
                </Text>
                <Text className="text-leben-text-muted text-xs mt-0.5">
                  {link.desc}
                </Text>
              </View>
              <Text className="text-leben-text-muted text-lg">›</Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>
    </>
  );
}
