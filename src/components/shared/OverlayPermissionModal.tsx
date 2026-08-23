/**
 * OverlayPermissionModal
 *
 * Shown once to first-time Android users. Covers two permissions that together
 * give Leben the best chance of delivering notifications reliably:
 *
 *  1. Battery Optimization Exemption — prevents the OS / OEM battery manager
 *     from killing scheduled alarms (the main cause of missed notifications on
 *     Samsung, Xiaomi, OnePlus, Huawei, etc.)
 *
 *  2. Display over other apps — allows notification banners to appear on top of
 *     other apps while the screen is on (heads-up banners, Android < 10).
 *
 * Stored flag: AsyncStorage key "leben_overlay_prompt_shown"
 */

import { Text } from "@/components/ui/Text";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Linking, Modal, Platform, TouchableOpacity, View } from "react-native";

const PROMPT_KEY   = "leben_overlay_prompt_shown";
const PACKAGE_NAME = "com.david.lebenmobile";

export default function OverlayPermissionModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    AsyncStorage.getItem(PROMPT_KEY)
      .then((val) => { if (!val) setVisible(true); })
      .catch(() => {});
  }, []);

  const markSeen = () =>
    AsyncStorage.setItem(PROMPT_KEY, "true").catch(() => {});

  const handleDone = () => {
    markSeen();
    setVisible(false);
  };

  /** Deep-links to Battery Optimization settings for Leben */
  const handleBatteryOptimization = async () => {
    // ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS opens a system dialog asking
    // the user to exempt this specific package from Doze / battery saver.
    const batteryUrl = `package:${PACKAGE_NAME}`;
    const intentUrl  =
      `intent://settings#Intent;` +
      `action=android.settings.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS;` +
      `data=${encodeURIComponent(batteryUrl)};` +
      `end`;

    try {
      const canOpen = await Linking.canOpenURL(intentUrl);
      await (canOpen ? Linking.openURL(intentUrl) : Linking.openSettings());
    } catch {
      await Linking.openSettings();
    }
  };

  /** Deep-links to Display over other apps for Leben */
  const handleOverlayPermission = async () => {
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

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" statusBarTranslucent>
      {/* Backdrop */}
      <View className="flex-1 items-center justify-center px-7 bg-black/75">
        {/* Card */}
        <View className="w-full bg-leben-bg-card rounded-3xl border border-leben-border-subtle p-7">

          {/* Icon badge */}
          <View className="w-[60px] h-[60px] rounded-[18px] items-center justify-center bg-leben-accent/10 border border-leben-accent/25 mb-5">
            <Text className="text-[28px]">🔔</Text>
          </View>

          {/* Heading */}
          <Text className="text-leben-text font-geist-bold text-2xl mb-2 tracking-tight">
            Enable Notifications
          </Text>
          <Text className="text-leben-text-muted text-sm leading-[20px] mb-6">
            Two quick steps are needed so Leben can reliably remind you about
            tasks, habits, and goals — even when your phone is idle or another
            app is open.
          </Text>

          {/* ── Step 1: Battery Optimization ─────────────────────────────── */}
          <View className="bg-leben-bg-secondary rounded-2xl p-4 mb-3 border border-leben-border-subtle">
            <View className="flex-row items-center gap-2 mb-1.5">
              <Text className="text-leben-accent font-geist-bold text-[13px]">Step 1</Text>
              <Text className="text-leben-text font-geist-semibold text-[13px]">
                Unrestricted Battery Usage
              </Text>
            </View>
            <Text className="text-leben-text-muted text-[12px] leading-[17px] mb-3">
              Android's battery manager can silently block scheduled reminders on
              Samsung, Xiaomi, OnePlus & Huawei devices. Exempting Leben ensures
              nudges fire on time, even overnight.
            </Text>
            <TouchableOpacity
              onPress={handleBatteryOptimization}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 12,
                backgroundColor: "#6b7fff",
                alignItems: "center",
                shadowColor: "#6b7fff",
                shadowOpacity: 0.4,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 3 },
                elevation: 6,
              }}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 13, color: "#fff", fontWeight: "700" }}>
                Disable Battery Restriction →
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Step 2: Display over other apps ──────────────────────────── */}
          <View className="bg-leben-bg-secondary rounded-2xl p-4 mb-6 border border-leben-border-subtle">
            <View className="flex-row items-center gap-2 mb-1.5">
              <Text className="text-leben-accent font-geist-bold text-[13px]">Step 2</Text>
              <Text className="text-leben-text font-geist-semibold text-[13px]">
                Display over other apps
              </Text>
            </View>
            <Text className="text-leben-text-muted text-[12px] leading-[17px] mb-3">
              Allows notification banners to appear on top of whatever you're
              doing — so a midday nudge won't be hidden behind another app.
            </Text>
            <TouchableOpacity
              onPress={handleOverlayPermission}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 12,
                backgroundColor: "rgba(107,127,255,0.15)",
                borderWidth: 1,
                borderColor: "rgba(107,127,255,0.35)",
                alignItems: "center",
              }}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 13, color: "#6b7fff", fontWeight: "700" }}>
                Allow Display over Apps →
              </Text>
            </TouchableOpacity>
          </View>

          {/* Done button */}
          <TouchableOpacity
            onPress={handleDone}
            style={{
              paddingVertical: 13,
              borderRadius: 14,
              backgroundColor: "rgba(255,255,255,0.05)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
              alignItems: "center",
            }}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 14, color: "#7070a0", fontWeight: "600" }}>
              Done
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}
