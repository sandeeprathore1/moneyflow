import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/src/hooks/useAuth';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAuth = segments[0] === '(auth)';
    const onOnboarding = segments.includes('onboarding');

    if (!isAuthenticated && !inAuth) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuth && !onOnboarding) {
      if (user && user.profile && !user.profile.onboarding_completed) {
        router.replace('/(auth)/onboarding');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, isLoading, segments, router, user]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="add-expense" options={{ presentation: 'modal' }} />
      <Stack.Screen name="auto-tracking" options={{ presentation: 'card', title: 'Auto Tracking' }} />
      <Stack.Screen name="assistant" options={{ presentation: 'card', title: 'AI Assistant' }} />
      <Stack.Screen name="subscriptions" options={{ presentation: 'card', title: 'Subscriptions' }} />
      <Stack.Screen name="budget-details" options={{ presentation: 'card', title: 'Budget Details' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
