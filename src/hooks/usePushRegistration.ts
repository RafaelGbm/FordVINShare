import { useEffect, useRef } from 'react';

import { getExpoPushRegistration } from '../utils/pushNotifications';
import { useRegisterDevice } from './useDevices';
import { useAuthStore } from '../utils/store';
import { secureStorage } from '../services/secureStorage';

/**
 * Registers the device's Expo push token with the backend once per login.
 * Silently no-ops if permission is denied or the token can't be obtained
 * (typical in Expo Go without EAS). The registered token is kept so logout
 * can unregister it; a failed attempt waits for the next login instead of
 * retrying on every render.
 */
export function usePushRegistration() {
  const role = useAuthStore((state) => state.role);
  const register = useRegisterDevice();
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (!role) {
      // Logged out: the next account that signs in registers again.
      attemptedRef.current = false;
      return;
    }
    if (attemptedRef.current) return;
    attemptedRef.current = true;

    (async () => {
      const registration = await getExpoPushRegistration();
      if (!registration) return;

      try {
        await register.mutateAsync({ token: registration.token, platform: registration.platform });
        await secureStorage.setPushToken(registration.token);
      } catch (e) {
        // 409 = token still active for another account; other errors are transient.
        console.warn('Failed to register device with backend', e);
      }
    })();
  }, [role, register]);
}
