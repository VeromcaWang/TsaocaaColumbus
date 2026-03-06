import React, { useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import AppNavigator from './src/navigation/AppNavigator';
import { useAuthStore } from './src/store/authStore';
import { registerForPushNotifications } from './src/utils/notifications';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    loadFromStorage();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      registerForPushNotifications();
    }
  }, [isAuthenticated]);

  return (
    <>
      <StatusBar style="dark" />
      <AppNavigator />
    </>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
