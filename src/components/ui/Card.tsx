import { View, TouchableOpacity } from 'react-native';
import type { ViewProps } from 'react-native';
import type { ReactNode } from 'react';

interface CardProps extends ViewProps {
  children: ReactNode;
  onPress?: () => void;
  className?: string;
  variant?: 'default' | 'outlined' | 'subtle';
}

export function Card({ children, onPress, className = '', variant = 'default', ...props }: CardProps) {
  const baseClass = 'rounded-card p-4';
  
  const variantClasses = {
    default: 'bg-leben-bg-card border border-leben-border',
    outlined: 'bg-transparent border border-leben-border',
    subtle: 'bg-leben-bg-secondary',
  };

  const containerClass = `${baseClass} ${variantClasses[variant]} ${className}`;

  if (onPress) {
    return (
      <TouchableOpacity 
        className={containerClass} 
        onPress={onPress} 
        activeOpacity={0.7}
        {...(props as any)}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View className={containerClass} {...props}>
      {children}
    </View>
  );
}
