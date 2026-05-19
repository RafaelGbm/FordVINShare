import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { bootstrapAuth } from '../src/services/auth.service';
import { useAuthStore } from '../src/utils/store';
import { usePushRegistration } from '../src/hooks/usePushRegistration';
import { useNotificationDeepLinks } from '../src/hooks/useNotificationDeepLinks';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    bootstrapAuth(() => {
      logout();
      router.replace('/');
    });
  }, [logout]);

  return (
    <QueryClientProvider client={queryClient}>
      <AppShell />
    </QueryClientProvider>
  );
}

function AppShell() {
  usePushRegistration();
  useNotificationDeepLinks();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(client)" />
        <Stack.Screen name="(analyst)" />
        <Stack.Screen
          name="nps/[serviceId]"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="customers/[customerId]"
          options={{ animation: 'slide_from_right' }}
        />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
