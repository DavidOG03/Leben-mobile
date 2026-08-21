import { supabase } from "@/lib/supabase/client";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Text } from "@/components/ui/Text";
import { GoogleIcon } from "@/constants/Icons";
import { Feather } from "@expo/vector-icons";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { Image } from "react-native";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showErrorToast = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  // ── Email / Password Sign In ──────────────────────────────────────────────

  const getFriendlyErrorMessage = (message: string) => {
    if (message.includes("Invalid login credentials")) {
      return "The email or password you entered is incorrect. Please double-check and try again.";
    }
    if (message.includes("Email not confirmed")) {
      return "Please verify your email address before signing in. Check your inbox for the confirmation link.";
    }
    if (message.includes("User not found")) {
      return "We could not find an account with this email. Please sign up first.";
    }
    if (message.includes("rate limit")) {
      return "You have tried signing in too many times. Please wait a moment and try again.";
    }
    return message;
  };

  const handleSignIn = async () => {
    setErrorMessage(null);
    if (!email || !password) {
      showErrorToast("Please enter your email and password.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) showErrorToast(getFriendlyErrorMessage(error.message));
    // On success, useAuthSync will detect the session change and AuthGuard will redirect
  };

  // ── Google OAuth ──────────────────────────────────────────────────────────

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      if (userInfo.data?.idToken) {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: userInfo.data.idToken,
        });

        if (error) throw error;
      } else {
        throw new Error("No ID token returned from Google Sign-In.");
      }
    } catch (err: any) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (err.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        showErrorToast(
          "Google Play Services are not available on this device.",
        );
      } else {
        showErrorToast(
          err.message ||
            "An error occurred during Google Sign In. Please try again or use email.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-leben-bg"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 justify-center px-6 relative">
        {/* Toast Error Notification */}
        {errorMessage ? (
          <View
            className="absolute top-16 left-6 right-6 bg-[#2a1a1a] border border-red-500/40 p-4 rounded-xl z-50 shadow-lg flex-row items-center"
            style={{
              elevation: 5,
              shadowColor: "#000",
              shadowOpacity: 0.3,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
            }}
          >
            <View className="w-1 h-full bg-red-500 rounded-full mr-3" />
            <Text className="text-leben-text text-sm font-geist-medium flex-1">
              {errorMessage}
            </Text>
          </View>
        ) : null}

        {/* Logo */}
        <View className="items-center mb-10">
          <View className="w-14 h-14 rounded-2xl bg-black border border-leben-border items-center justify-center mb-4">
            <Image
              source={require("../../../assets/images/notification-icon.png")}
              style={{ width: 24, height: 24 }}
              resizeMode="cover"
            />
          </View>
          <Text className="text-3xl font-geist-bold text-leben-text tracking-tight">
            Leben
          </Text>
          <Text className="text-leben-text-2 font-geist-medium text-sm mt-1">
            Your productivity OS
          </Text>
        </View>

        {/* Form */}
        <View className="gap-3">
          <TextInput
            className="bg-leben-bg-card border border-leben-border-subtle text-leben-text px-4 py-3.5 rounded-input text-[15px]"
            placeholder="Email"
            placeholderTextColor="#555"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

          <View className="relative justify-center z-10">
            <TextInput
              className="bg-leben-bg-card border border-leben-border-subtle text-leben-text px-4 py-3.5 pr-12 rounded-input text-[15px]"
              placeholder="Password"
              placeholderTextColor="#555"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              className="absolute right-0 top-0 bottom-0 px-4 justify-center items-center z-20"
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Feather
                name={showPassword ? "eye" : "eye-off"}
                size={20}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="bg-leben-accent rounded-btn py-3.5 items-center mt-2 z-0"
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-geist-semibold text-[15px]">
                Sign In
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View className="flex-row items-center my-6">
          <View className="flex-1 h-px bg-leben-border" />
          <Text className="text-leben-text-muted text-xs mx-3">OR</Text>
          <View className="flex-1 h-px bg-leben-border" />
        </View>

        {/* Google OAuth */}
        <TouchableOpacity
          className="bg-leben-bg-card border border-leben-border-subtle rounded-btn py-3.5 items-center flex-row justify-center gap-2"
          onPress={handleGoogleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <GoogleIcon size={20} />

              <Text className="text-leben-text font-geist-medium text-[15px]">
                Continue with Google
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Sign Up Link */}
        <TouchableOpacity
          className="mt-8 items-center"
          onPress={() => router.push("/(auth)/sign-up" as any)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text className="text-leben-text-2 text-sm">
            Don't have an account?{" "}
            <Text className="text-leben-accent font-geist-semibold">
              Sign up
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
