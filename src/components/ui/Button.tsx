import { TouchableOpacity, ActivityIndicator } from 'react-native';
import type { TouchableOpacityProps } from 'react-native';
import { Text } from '@/components/ui/Text';


interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClass = 'items-center justify-center rounded-btn flex-row gap-2';
  
  const sizeClasses = {
    sm: 'py-2 px-3',
    md: 'py-3.5 px-4',
    lg: 'py-4 px-6',
  };
  
  const variantClasses = {
    primary: 'bg-leben-accent',
    secondary: 'bg-leben-bg-element border border-leben-border',
    danger: 'bg-leben-error',
    ghost: 'bg-transparent',
  };
  
  const textClasses = {
    primary: 'text-white font-semibold',
    secondary: 'text-leben-text font-medium',
    danger: 'text-white font-semibold',
    ghost: 'text-leben-accent font-medium',
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      className={`${baseClass} ${sizeClasses[size]} ${variantClasses[variant]} ${isDisabled ? 'opacity-50' : ''} ${className}`}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' || variant === 'ghost' ? 'var(--accent-blue)' : 'var(--text-primary)'} size="small" />
      ) : (
        <Text className={`${textClasses[variant]} ${size === 'sm' ? 'text-sm' : 'text-[15px]'}`}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
