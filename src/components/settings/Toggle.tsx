import React from "react";
import { TouchableOpacity, View } from "react-native";

export function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <TouchableOpacity
      onPress={onChange}
      activeOpacity={0.8}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 2,
      }}
      className={`${on ? "bg-leben-accent" : "bg-leben-border"}`}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: "#ffffff",
          transform: [{ translateX: on ? 20 : 0 }],
        }}
      />
    </TouchableOpacity>
  );
}
