import type { ReactNode } from "react";
import type { ViewProps } from "react-native";
import { TouchableOpacity, View } from "react-native";

interface CardProps extends ViewProps {
  children: ReactNode;
  onPress?: () => void;
  className?: string;
  variant?: "default" | "outlined" | "subtle" | "accent" | "none";
}

export function Card({
  children,
  onPress,
  className = "",
  variant = "default",
  ...props
}: CardProps) {
  const baseClass = "rounded-card p-4";

  const variantClasses = {
    default: "bg-leben-bg-card border border-leben-border",
    outlined: "bg-transparent border border-leben-border",
    subtle: "bg-leben-bg-secondary",
    accent: "bg-leben-accent-75 border border-leben-accent-90",
    none: "",
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
