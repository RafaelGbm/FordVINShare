import { useEffect, useRef } from 'react';
import Constants from 'expo-constants';

import { getExpoPushRegistration } from '../utils/pushNotifications';
import { useRegisterDevice } from './useDevices';
import { useAuthStore } from '../utils/store';

/**
 * Registers the device's Expo push token with the backend the first time
 * the user is authenticated in this app session. Silently no-ops if
 * permission is denied, if the token can't be obtained (typical in Expo
 * Go without EAS) or if the backend register call fails.
 */
export function usePushRegistration() {
  const role = useAuthStore((state) => state.role);
  const register = useRegisterDevice();
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (!role || attemptedRef.current) return;
    attemptedRef.current = true;

    (async () => {
      const registration = await getExpoPushRegistration();
      if (!registration) return;

      try {
        await register.mutateAsync({
          expoPushToken: registration.token,
          platform: registration.platform,
          appVersion: Constants.expoConfig?.version ?? '0.0.0',
          consentAt: new Date().toISOString(),
        });
      } catch (e) {
        // Backend rejected the token (could be 401 mid-refresh, or
        // server error). We'll try again next session.
        console.warn('Failed to register device with backend', e);
        attemptedRef.current = false;
      }
    })();
  }, [role, register]);
}
