import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';

import LoginScreen from '../src/screens/LoginScreen';
import { useAuthStore } from '../src/utils/store';
import { secureStorage } from '../src/services/secureStorage';
import { authService } from '../src/services/auth.service';
import { COLORS } from '../src/constants';
import FordLogo from '../src/components/FordLogo';

export default function Index() {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    // Bootstrap intentionally runs once on mount. We read the current
    // user from getState() (no subscription) so subsequent updates
    // don't restart the effect, and call setUser the same way to
    // avoid pulling a (stable) selector reference into the deps.
    let cancelled = false;

    (async () => {
      if (useAuthStore.getState().user) {
        if (!cancelled) setBootstrapping(false);
        return;
      }

      const token = await secureStorage.getAccessToken();
      if (!token) {
        if (!cancelled) setBootstrapping(false);
        return;
      }

      try {
        const me = await authService.getMe();
        if (cancelled) return;
        const mappedRole = me.role === 'ANALYST' ? 'analyst' : 'client';
        useAuthStore.getState().setUser(
          {
            id: me.userId,
            email: me.email,
            name: me.name,
            phone: me.phone,
            role: mappedRole,
            created_at: me.createdAt,
          },
          mappedRole
        );
      } catch {
        // Refresh flow already cleared storage in the interceptor.
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (bootstrapping) {
    return (
      <View style={styles.splash}>
        <FordLogo width={200} height={80} />
        <ActivityIndicator size="small" color="#fff" style={{ marginTop: 24 }} />
      </View>
    );
  }

  if (user && role === 'client') {
    return <Redirect href="/(client)/home" />;
  }
  if (user && role === 'analyst') {
    return <Redirect href="/(analyst)/dashboard" />;
  }

  return <LoginScreen />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
