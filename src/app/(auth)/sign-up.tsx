import { Text } from "@/components/ui/Text";
import { GoogleIcon } from "@/constants/Icons";
import { supabase } from "@/lib/supabase/client";
import { Feather } from "@expo/vector-icons";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

function passwordStrength(pw: string): {
  label: string;
  color: string;
  pct: number;
} {
  if (pw.length === 0) return { label: "", color: "transparent", pct: 0 };
  if (pw.length < 6) return { label: "Weak", color: "#ef4444", pct: 0.33 };
  if (pw.length < 10) return { label: "Fair", color: "#f59e0b", pct: 0.66 };
  return { label: "Strong", color: "#4caf7d", pct: 1 };
}

export default function SignUpScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const strength = passwordStrength(password);

  const showErrorToast = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  const getFriendlyErrorMessage = (message: string) => {
    if (message.includes("User already registered")) {
      return "An account with this email already exists. Try signing in instead.";
    }
    if (message.includes("Password should be at least")) {
      return "Your password is too weak. Please use at least 6 characters.";
    }
    if (message.includes("rate limit")) {
      return "Too many sign-up attempts. Please wait a moment and try again.";
    }
    return message;
  };

  const handleSignUp = async () => {
    setErrorMessage(null);
    if (!fullName || !email || !password) {
      showErrorToast("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      showErrorToast("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);
    if (error) {
      showErrorToast(getFriendlyErrorMessage(error.message));
    } else {
      if (!data.session && data.user) {
        // Email confirmation required
        showErrorToast(
          "Success! Please check your email to confirm your account before signing in.",
        );
        setTimeout(() => {
          router.replace("/(auth)/sign-in" as any);
        }, 3000);
      }
      // If logged in immediately (email confirmation disabled), AuthGuard will detect the session and redirect to /(tabs) automatically.
    }
  };

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
            "An error occurred during Google Sign Up. Please try again or use email.",
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
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 24,
          paddingVertical: 40,
          position: "relative",
        }}
      >
        {/* Toast Error Notification */}
        {errorMessage ? (
          <View
            className="absolute top-10 left-6 right-6 bg-[#2a1a1a] border border-red-500/40 p-4 rounded-xl z-50 shadow-lg flex-row items-center"
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
        <View className="items-center mb-8 mt-6">
          <View className="w-14 h-14 rounded-2xl bg-black border border-leben-border items-center justify-center mb-4">
            <Image
              source={require("../../../assets/images/notification-icon.png")}
              style={{ width: 24, height: 24 }}
              resizeMode="cover"
            />
          </View>
          <Text className="text-3xl font-geist-bold text-leben-text tracking-tight">
            Welcome to Leben
          </Text>
          <Text className="text-leben-text-2 font-geist-medium text-sm mt-1">
            It only takes a moment. Let's get you set up.
          </Text>
        </View>

        {/* Form */}
        <View className="gap-3">
          <TextInput
            className="bg-leben-bg-card border border-leben-border-subtle text-leben-text px-4 py-3.5 rounded-input text-[15px]"
            placeholder="Full Name"
            placeholderTextColor="#555"
            autoCapitalize="words"
            value={fullName}
            onChangeText={setFullName}
          />

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

          <View className="gap-1.5">
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
            {/* Password strength bar */}
            {password.length > 0 && (
              <View className="flex-row items-center gap-2">
                <View className="flex-1 h-1 bg-leben-border rounded-full overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${strength.pct * 100}%`,
                      backgroundColor: strength.color,
                    }}
                  />
                </View>
                <Text className="text-xs" style={{ color: strength.color }}>
                  {strength.label}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            className="bg-leben-accent rounded-btn py-3.5 items-center mt-2 z-0"
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-geist-semibold text-[15px]">
                Create Account
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

        {/* Google */}
        <TouchableOpacity
          className="bg-leben-bg-card border border-leben-border-subtle rounded-btn py-3.5 items-center flex-row justify-center gap-2"
          onPress={handleGoogleSignIn}
          disabled={loading}
        >
          <GoogleIcon size={20} />
          <Text className="text-leben-text font-geist-medium text-[15px]">
            Continue with Google
          </Text>
        </TouchableOpacity>

        {/* Sign In Link */}
        <TouchableOpacity
          className="mt-8 items-center"
          onPress={() => router.replace("/(auth)/sign-in" as any)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text className="text-leben-text-2 text-sm">
            Already have an account?{" "}
            <Text className="text-leben-accent font-geist-semibold">
              Sign in
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
