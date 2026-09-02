import { SyncCompleteIcon, SyncingIcon } from "@/constants/Icons";
import { Text, View, StyleSheet } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";

interface ToastProps {
  message: string;
  type: "info" | "syncing" | "success" | "error";
}

export function Toast({ message, type }: ToastProps) {
  const isSyncing = type === "syncing";
  const isSuccess = type === "success";
  const isError = type === "error";

  let title = "Notification";
  let icon = null;
  let iconBg = "rgba(124,106,240,0.15)";
  let iconColor = "#7c6af0";
  let borderColor = "rgba(124,106,240,0.3)";

  if (isSyncing) {
    title = "Background Sync";
    icon = <SyncingIcon color={iconColor} />;
  } else if (isSuccess) {
    title = "Sync Complete";
    iconBg = "rgba(34,197,94,0.15)";
    iconColor = "#22c55e";
    borderColor = "rgba(34,197,94,0.3)";
    icon = <SyncCompleteIcon color={iconColor} />;
  } else if (isError) {
    title = "Sync Error";
    iconBg = "rgba(239,68,68,0.15)";
    iconColor = "#ef4444";
    borderColor = "rgba(239,68,68,0.3)";
    icon = <Text style={{ color: iconColor, fontWeight: 'bold' }}>!</Text>;
  } else {
    title = "Network Status";
    icon = <Text style={{ color: iconColor, fontWeight: 'bold' }}>i</Text>;
  }

  return (
    <Animated.View
      entering={FadeInUp.duration(350)}
      exiting={FadeOutUp.duration(200)}
      style={[styles.toastContainer, { borderColor }]}
      className="mb-3 w-full"
    >
      <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
        {icon}
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: iconColor }]}>{title}</Text>
        <Text style={styles.body}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#1a1a1e",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
    pointerEvents: "auto",
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  body: {
    marginTop: 4,
    fontSize: 13,
    color: "#e0e0e0",
    lineHeight: 18,
  },
});
