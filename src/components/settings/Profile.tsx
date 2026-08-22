import { Text } from "@/components/ui/Text";
import { useLebenStore } from "@/store/useStore";
import React from "react";
import { View } from "react-native";
import { ProfileIcon } from "@/constants/Icons";

export function Profile() {
  const userId = useLebenStore((s) => s.userId);
  const userFullName = useLebenStore((s: any) => s.userFullName);
  const userEmail = useLebenStore((s: any) => s.userEmail);

  const displayName = userFullName || "Leben User";
  const displayEmail = userEmail || "---";

  return (
    <>
      {/* Profile section */}
      <View className="flex-row items-start gap-6 mb-8">
        {/* Avatar */}
        <View className="relative">
          <View className="rounded-2xl overflow-hidden items-center justify-center w-[88px] h-[88px] bg-leben-bg-element border border-leben-border-subtle">
            <View className="w-full h-full items-center justify-center bg-leben-bg-secondary">
              <ProfileIcon size={40} color="#6b7fff" />
            </View>
          </View>
        </View>

        {/* Name / badge */}
        <View className="justify-center mt-2">
          <Text
            className="font-geist-ultrablack text-leben-text capitalize"
            style={{ fontSize: 26, letterSpacing: -0.5, marginBottom: 4 }}
          >
            {userId ? displayName : "Guest"}
          </Text>
          <Text className="text-[13px] text-leben-text-muted">
            {userId ? displayEmail : "Guest Mode - Local Data Only"}
          </Text>
        </View>
      </View>

      {/* Display name + Workspace ID */}
      <View className="flex-row flex-wrap gap-4 mb-4">
        {[
          { label: "DISPLAY NAME", val: userId ? displayName : "Guest" },
          {
            label: "WORKSPACE ID",
            val: userId
              ? `OS-${userId.substring(0, 8).toUpperCase()}`
              : "LOCAL-WORKSPACE",
          },
        ].map(({ label, val }) => (
          <View
            key={label}
            className="rounded-xl p-4 flex-1 min-w-[150px] bg-leben-bg-card border border-leben-border"
          >
            <Text
              className="text-[9px] text-leben-text-muted uppercase mb-1.5"
              style={{ letterSpacing: 1.4 }}
            >
              {label}
            </Text>
            <Text
              className="font-geist-medium text-leben-text-2 capitalize"
              style={{ fontSize: 15 }}
            >
              {val}
            </Text>
          </View>
        ))}
      </View>
    </>
  );
}
