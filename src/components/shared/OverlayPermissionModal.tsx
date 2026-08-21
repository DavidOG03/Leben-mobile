/**
 * OverlayPermissionModal
 *
 * Shown once to first-time Android users explaining that they should enable
 * "Display over other apps" so Leben notifications appear as banners even when
 * the device screen is on or the app is backgrounded.
 *
 * Stored flag: AsyncStorage key "leben_overlay_prompt_shown"
 */

import { Text } from "@/components/ui/Text";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Linking, Modal, Platform, TouchableOpacity, View } from "react-native";

const PROMPT_KEY = "leben_overlay_prompt_shown";
const PACKAGE_NAME = "com.david.lebenmobile";

export default function OverlayPermissionModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    AsyncStorage.getItem(PROMPT_KEY)
      .then((val) => {
        if (!val) setVisible(true);
      })
      .catch(() => {});
  }, []);

  const markSeen = () =>
    AsyncStorage.setItem(PROMPT_KEY, "true").catch(() => {});

  const handleEnable = async () => {
    markSeen();
    setVisible(false);

    // Deep-link directly to "Display over other apps" for this app
    const intentUrl =
      `intent://settings#Intent;` +
      `action=android.settings.action.MANAGE_OVERLAY_PERMISSION;` +
      `data=package%3A${PACKAGE_NAME};` +
      `end`;

    try {
      const canOpen = await Linking.canOpenURL(intentUrl);
      await (canOpen ? Linking.openURL(intentUrl) : Linking.openSettings());
    } catch {
      await Linking.openSettings();
    }
  };

  const handleLater = () => {
    markSeen();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      {/* Backdrop */}
      <View className="flex-1 items-center justify-center px-7 bg-black/75">
        {/* Card */}
        <View className="w-full bg-leben-bg-card rounded-3xl border border-leben-border-subtle p-7">
          {/* Icon badge */}
          <View className="w-[60px] h-[60px] rounded-[18px] items-center justify-center bg-leben-accent/10 border border-leben-accent/25 mb-5">
            <Text className="text-[28px]">🔔</Text>
          </View>

          {/* Heading */}
          <Text className="text-leben-text font-geist-bold text-2xl mb-2.5 tracking-tight">
            Enable Notifications
          </Text>

          {/* Body */}
          <Text className="text-leben-text-muted text-sm leading-[20px] mb-7">
            To receive task reminders, habit nudges, and goal alerts even when
            Leben is running in the background, please enable{" "}
            <Text className="text-leben-accent-light font-geist-semibold">
              Display over other apps
            </Text>{" "}
            in your Android settings for Leben.
          </Text>

          {/* Step-by-step hint */}
          <View className="bg-leben-bg-secondary rounded-xl p-3.5 mb-7 gap-1.5">
            {[
              '1. Tap "Enable" below',
              "2. Find Leben in the list",
              '3. Toggle "Allow display over other apps"',
            ].map((step) => (
              <Text
                key={step}
                style={{ fontSize: 12, color: "#7070a0", lineHeight: 18 }}
              >
                {step}
              </Text>
            ))}
          </View>

          {/* Buttons */}
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              onPress={handleLater}
              style={{
                flex: 1,
                paddingVertical: 13,
                borderRadius: 14,
                backgroundColor: "rgba(255,255,255,0.05)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
                alignItems: "center",
              }}
              activeOpacity={0.7}
            >
              <Text
                style={{ fontSize: 14, color: "#7070a0", fontWeight: "600" }}
              >
                Later
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleEnable}
              style={{
                flex: 2,
                paddingVertical: 13,
                borderRadius: 14,
                backgroundColor: "#7c6af0",
                alignItems: "center",
                shadowColor: "#7c6af0",
                shadowOpacity: 0.45,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 4 },
                elevation: 8,
              }}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 13, color: "#fff", fontWeight: "700" }}>
                Enable Now
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
