import { TextInput, View, Text } from 'react-native';
import type { TextInputProps } from 'react-native';
import { LC } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  containerClassName?: string;
}

export function Input({ label, error, icon, className = '', containerClassName = '', ...props }: InputProps) {
  return (
    <View className={`gap-1.5 ${containerClassName}`}>
      {label && (
        <Text className="text-leben-text-2 text-[13px] font-medium ml-1">
          {label}
        </Text>
      )}
      <View className="relative justify-center">
        {icon && (
          <View className="absolute left-3 z-10">
            {icon}
          </View>
        )}
        <TextInput
          placeholderTextColor={LC.textMuted}
          className={`bg-leben-bg-card border ${
            error ? 'border-leben-error' : 'border-leben-border'
          } text-leben-text rounded-input px-4 py-3.5 text-[15px] ${
            icon ? 'pl-10' : ''
          } ${className}`}
          {...props}
        />
      </View>
      {error && (
        <Text className="text-leben-error text-xs ml-1 mt-0.5">
          {error}
        </Text>
      )}
    </View>
  );
}
