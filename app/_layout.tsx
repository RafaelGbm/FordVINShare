import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

import { bootstrapAuth } from '../src/services/auth.service';
import { useAuthStore } from '../src/utils/store';
import { usePushRegistration } from '../src/hooks/usePushRegistration';
import { useNotificationDeepLinks } from '../src/hooks/useNotificationDeepLinks';
import {
  QUERY_CACHE_BUSTER,
  queryPersister,
  shouldPersistQuery,
} from '../src/services/queryPersist';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // Keep cached data around for 24h so the persisted entries are
      // not garbage-collected before the next launch.
      gcTime: 24 * 60 * 60 * 1000,
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
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: queryPersister,
        maxAge: 24 * 60 * 60 * 1000,
        buster: QUERY_CACHE_BUSTER,
        dehydrateOptions: { shouldDehydrateQuery: shouldPersistQuery },
      }}
    >
      <AppShell />
    </PersistQueryClientProvider>
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
