import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

import { parseDeepLink } from '../utils/deepLinks';

/**
 * Wires up two listeners:
 *
 * 1. While the app is running, decides how to show notifications when
 *    they arrive in the foreground (banner + sound, no badge).
 * 2. When the user taps a notification, reads the deepLink field from
 *    its data payload and navigates the app to the matching screen.
 *
 * The initial tap that *launched* the app from a killed state is also
 * handled via getLastNotificationResponseAsync.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function handleResponse(response: Notifications.NotificationResponse) {
  const deepLink = response.notification.request.content.data?.deepLink as
    | string
    | undefined;
  const route = parseDeepLink(deepLink);
  if (route) {
    router.push(route as any);
  }
}

export function useNotificationDeepLinks() {
  useEffect(() => {
    // Cold-start: app was opened by tapping a notification.
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) handleResponse(response);
    });

    // Warm-start: app was already running.
    const subscription =
      Notifications.addNotificationResponseReceivedListener(handleResponse);

    return () => subscription.remove();
  }, []);
}
