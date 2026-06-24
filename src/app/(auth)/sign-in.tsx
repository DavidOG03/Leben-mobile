import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter }  from 'expo-router';
import { supabase }   from '@/lib/supabase/client';

import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Feather } from '@expo/vector-icons';

// Complete auth session for web/browser
WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const router  = useRouter();
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ── Email / Password Sign In ──────────────────────────────────────────────

  const getFriendlyErrorMessage = (message: string) => {
    if (message.includes('Invalid login credentials')) {
      return 'The email or password you entered is incorrect. Please double-check and try again.';
    }
    if (message.includes('Email not confirmed')) {
      return 'Please verify your email address before signing in. Check your inbox for the confirmation link.';
    }
    if (message.includes('User not found')) {
      return 'We could not find an account with this email. Please sign up first.';
    }
    if (message.includes('rate limit')) {
      return 'You have tried signing in too many times. Please wait a moment and try again.';
    }
    return message;
  };

  const handleSignIn = async () => {
    setErrorMessage(null);
    if (!email || !password) {
      setErrorMessage('Please enter your email and password.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setErrorMessage(getFriendlyErrorMessage(error.message));
    // On success, useAuthSync will detect the session change and AuthGuard will redirect
  };

  // ── Google OAuth ──────────────────────────────────────────────────────────

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      const redirectUrl = Linking.createURL('/(auth)/callback');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      if (!data.url) throw new Error('No OAuth URL returned');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

      if (result.type === 'success') {
        const { url } = result;
        // Parse the URL to pass the hash to Supabase
        const params = new URL(url.replace('#', '?')).searchParams;
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        } else {
          // Alternative fallback for implicit grant parsing
          await supabase.auth.getSession();
        }
      }
    } catch (err: any) {
      setErrorMessage(getFriendlyErrorMessage(err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-leben-bg"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 justify-center px-6">
        {/* Logo */}
        <View className="items-center mb-10">
          <View className="w-14 h-14 rounded-2xl bg-leben-bg-card border border-leben-border items-center justify-center mb-4">
            <Text className="text-2xl">✦</Text>
          </View>
          <Text className="text-3xl font-bold text-leben-text tracking-tight">
            Leben
          </Text>
          <Text className="text-leben-text-2 text-sm mt-1">
            Your productivity OS
          </Text>
        </View>

        {/* Form */}
        <View className="gap-3">
          {errorMessage ? (
            <View className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl mb-1">
              <Text className="text-red-500 text-sm text-center">{errorMessage}</Text>
            </View>
          ) : null}

          <TextInput
            className="bg-leben-bg-card border border-leben-border text-leben-text px-4 py-3.5 rounded-input text-[15px]"
            placeholder="Email"
            placeholderTextColor="#555"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

          <View className="relative justify-center">
            <TextInput
              className="bg-leben-bg-card border border-leben-border text-leben-text px-4 py-3.5 pr-12 rounded-input text-[15px]"
              placeholder="Password"
              placeholderTextColor="#555"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity 
              className="absolute right-4"
              onPress={() => setShowPassword(!showPassword)}
            >
              <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#888" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="bg-leben-accent rounded-btn py-3.5 items-center mt-2"
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-[15px]">Sign In</Text>
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
          className="bg-leben-bg-card border border-leben-border rounded-btn py-3.5 items-center flex-row justify-center gap-2"
          onPress={handleGoogleSignIn}
          disabled={loading}
        >
          <Text className="text-xl">G</Text>
          <Text className="text-leben-text font-medium text-[15px]">
            Continue with Google
          </Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <TouchableOpacity
          className="mt-8 items-center"
          onPress={() => router.push('/(auth)/sign-up' as any)}
        >
          <Text className="text-leben-text-2 text-sm">
            Don't have an account?{' '}
            <Text className="text-leben-accent font-semibold">Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
