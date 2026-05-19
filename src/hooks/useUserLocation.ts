import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

// Centro de São Paulo — used when the user denies location, when the
// app runs on web, or when the GPS read fails. Keeps the locator and
// scheduling screens functional with a reasonable radius.
export const FALLBACK_COORDS = { lat: -23.55, lng: -46.63 };

export type LocationStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'denied'
  | 'unavailable';

export interface UserLocation {
  lat: number;
  lng: number;
  isFallback: boolean;
  status: LocationStatus;
}

/**
 * Resolves the user's current coordinates once, falling back to São
 * Paulo if the permission is denied, the platform doesn't support it
 * or the GPS read errors out. Status tells the caller why we're using
 * the fallback so a "ativar localização" hint can be rendered.
 */
export function useUserLocation(): UserLocation {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [status, setStatus] = useState<LocationStatus>('idle');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (Platform.OS === 'web') {
        if (!cancelled) setStatus('unavailable');
        return;
      }

      setStatus('loading');

      const { status: permStatus } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;

      if (permStatus !== 'granted') {
        setStatus('denied');
        return;
      }

      try {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (cancelled) return;
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('unavailable');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (coords && status === 'ready') {
    return { ...coords, isFallback: false, status };
  }

  return { ...FALLBACK_COORDS, isFallback: true, status };
}
