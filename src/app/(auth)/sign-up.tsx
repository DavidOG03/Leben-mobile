import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase }  from '@/lib/supabase/client';
import { Feather } from '@expo/vector-icons';

function passwordStrength(pw: string): { label: string; color: string; pct: number } {
  if (pw.length === 0)  return { label: '',       color: 'transparent',    pct: 0 };
  if (pw.length < 6)    return { label: 'Weak',   color: '#ef4444',        pct: 0.33 };
  if (pw.length < 10)   return { label: 'Fair',   color: '#f59e0b',        pct: 0.66 };
  return                       { label: 'Strong', color: '#4caf7d',        pct: 1 };
}

export default function SignUpScreen() {
  const router    = useRouter();
  const [fullName, setFullName]   = useState('');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const strength = passwordStrength(password);

  const getFriendlyErrorMessage = (message: string) => {
    if (message.includes('User already registered')) {
      return 'An account with this email already exists. Try signing in instead.';
    }
    if (message.includes('Password should be at least')) {
      return 'Your password is too weak. Please use at least 6 characters.';
    }
    if (message.includes('rate limit')) {
      return 'Too many sign-up attempts. Please wait a moment and try again.';
    }
    return message;
  };

  const handleSignUp = async () => {
    setErrorMessage(null);
    if (!fullName || !email || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);
    if (error) {
      setErrorMessage(getFriendlyErrorMessage(error.message));
    } else {
      Alert.alert(
        'Check your email',
        'We sent a confirmation link to your email. Click it to activate your account.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/sign-in' as any) }],
      );
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'leben://auth/callback' },
    });
    setLoading(false);
    if (error) setErrorMessage(getFriendlyErrorMessage(error.message));
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-leben-bg"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 }}>
        {/* Logo */}
        <View className="items-center mb-8">
          <View className="w-14 h-14 rounded-2xl bg-leben-bg-card border border-leben-border items-center justify-center mb-4">
            <Text className="text-2xl">✦</Text>
          </View>
          <Text className="text-3xl font-bold text-leben-text tracking-tight">
            Create Account
          </Text>
          <Text className="text-leben-text-2 text-sm mt-1">
            Start your productive journey
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
            placeholder="Full Name"
            placeholderTextColor="#555"
            autoCapitalize="words"
            value={fullName}
            onChangeText={setFullName}
          />

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

          <View className="gap-1.5">
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
            className="bg-leben-accent rounded-btn py-3.5 items-center mt-2"
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-[15px]">Create Account</Text>
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
          className="bg-leben-bg-card border border-leben-border rounded-btn py-3.5 items-center flex-row justify-center gap-2"
          onPress={handleGoogleSignIn}
          disabled={loading}
        >
          <Text className="text-xl">G</Text>
          <Text className="text-leben-text font-medium text-[15px]">
            Continue with Google
          </Text>
        </TouchableOpacity>

        {/* Sign In Link */}
        <TouchableOpacity
          className="mt-8 items-center"
          onPress={() => router.replace('/(auth)/sign-in' as any)}
        >
          <Text className="text-leben-text-2 text-sm">
            Already have an account?{' '}
            <Text className="text-leben-accent font-semibold">Sign in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
