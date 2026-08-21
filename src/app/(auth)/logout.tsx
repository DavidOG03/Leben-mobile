import { useState } from 'react';
import { View, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase }  from '@/lib/supabase/client';
import { Text } from '@/components/ui/Text';
import { GoogleIcon } from '@/constants/Icons';
import { Image } from 'react-native';
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

export default function LogoutScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showErrorToast = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 5000);
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
        showErrorToast("Google Play Services are not available on this device.");
      } else {
        showErrorToast(
          err.message ||
            "An error occurred during Google Sign In. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-leben-bg">
      <View className="flex-1 justify-center px-6 relative">
        
        {/* Toast Error Notification */}
        {errorMessage ? (
          <View 
            className="absolute top-10 left-6 right-6 bg-[#2a1a1a] border border-red-500/40 p-4 rounded-xl z-50 shadow-lg flex-row items-center"
            style={{ elevation: 5, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}
          >
            <View className="w-1 h-full bg-red-500 rounded-full mr-3" />
            <Text className="text-leben-text text-sm font-geist-medium flex-1">{errorMessage}</Text>
          </View>
        ) : null}

        {/* Logo */}
        <View className="items-center mb-10 mt-6">
          <View className="w-16 h-16 rounded-2xl bg-leben-bg-card border border-leben-border items-center justify-center mb-6 shadow-sm">
            <Image 
              source={require("../../../assets/images/notification-icon.png")}
              style={{ width: 28, height: 28 }}
              resizeMode="contain"
            />
          </View>
          <Text className="text-3xl font-geist-bold text-leben-text tracking-tight mb-2">
            You're Signed Out
          </Text>
          <Text className="text-leben-text-muted text-[15px] text-center px-4 leading-[22px]">
            You have successfully logged out. Your data is now saved locally in Guest Mode.
          </Text>
        </View>

        <View className="gap-4 mt-8">
          <TouchableOpacity
            className="bg-leben-accent rounded-btn py-4 items-center shadow-sm"
            onPress={() => router.replace('/(auth)/sign-in' as any)}
            disabled={loading}
          >
            <Text className="text-white font-geist-semibold text-[16px]">Sign In Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-leben-bg-card border border-leben-border rounded-btn py-4 items-center flex-row justify-center gap-2"
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#888" />
            ) : (
              <>
                <GoogleIcon size={20} />
                <Text className="text-leben-text font-geist-medium text-[16px]">Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-transparent py-4 items-center mt-2"
            onPress={() => router.replace('/(tabs)' as any)}
            disabled={loading}
          >
            <Text className="text-leben-text-2 font-geist-medium text-[15px]">Continue as Guest</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
