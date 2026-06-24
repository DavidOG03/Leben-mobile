// components/shared/ScreenLayout.tsx
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';

interface ScreenLayoutProps {
  children:  ReactNode;
  scrollable?: boolean;
  className?:  string;
}

export function ScreenLayout({ children, scrollable = true, className = '' }: ScreenLayoutProps) {
  const content = (
    <View className={`flex-1 bg-leben-bg ${className}`}>
      {children}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-leben-bg">
      {scrollable ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : content}
    </SafeAreaView>
  );
}
