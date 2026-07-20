import { Text } from "@/components/ui/Text";
import { View } from "react-native";

interface BadgeProps {
  label: string;
  variant?: "default" | "success" | "error" | "warning" | "primary" | "outline";
  className?: string;
  icon?: string;
  numberOfLines?: number;
}

export function Badge({
  label,
  variant = "default",
  className = "",
  icon,
  numberOfLines = 1,
}: BadgeProps) {
  const variantClasses = {
    default: "bg-leben-bg-element border border-leben-border text-leben-text-2",
    success:
      "bg-[rgba(76,175,125,0.12)] border border-[rgba(76,175,125,0.2)] text-leben-success",
    error:
      "bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-leben-error",
    warning:
      "bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] text-prio-medium",
    primary:
      "bg-leben-accent-dim border border-[rgba(124,106,240,0.2)] text-leben-accent",
    outline: "bg-transparent border border-leben-border text-leben-text-2",
  };

  const textClasses = {
    default: "text-leben-text-2",
    success: "text-leben-success",
    error: "text-leben-error",
    warning: "text-prio-medium",
    primary: "text-leben-text-2",
    outline: "text-leben-text-2",
  };

  return (
    <View
      className={`flex-row items-center rounded-chip px-2.5 py-1 flex-shrink ${variantClasses[variant]} ${className}`}
    >
      {icon && (
        <Text className={`text-xs mr-1 ${textClasses[variant]}`}>{icon}</Text>
      )}
      <Text
        className={`text-[11px] font-medium uppercase tracking-wider ${textClasses[variant]}`}
        numberOfLines={numberOfLines === 0 ? undefined : numberOfLines}
      >
        {label}
      </Text>
    </View>
  );
}
