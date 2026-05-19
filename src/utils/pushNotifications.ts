import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { DevicePlatform } from '../services/devices.service';

export interface PushRegistration {
  token: string;
  platform: DevicePlatform;
}

/**
 * Asks the user for notification permission, then resolves to the Expo
 * push token. Returns null if the user denies, if we're running in a
 * simulator that doesn't support push, or if no projectId is available
 * (typical for local dev before EAS is configured).
 */
export async function getExpoPushRegistration(): Promise<PushRegistration | null> {
  if (Platform.OS === 'web') return null;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let final = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    final = status;
  }
  if (final !== 'granted') return null;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    (Constants.easConfig as { projectId?: string } | undefined)?.projectId;

  try {
    const token = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    const platform: DevicePlatform = Platform.OS === 'ios' ? 'ios' : 'android';
    return { token: token.data, platform };
  } catch (e) {
    // Common in local Expo Go without EAS — fail silently rather than
    // breaking the auth bootstrap.
    console.warn('Could not obtain Expo push token', e);
    return null;
  }
}
