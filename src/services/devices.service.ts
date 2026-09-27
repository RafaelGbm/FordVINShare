import { api } from './api';

/** Device platform as reported by Expo. */
export type DevicePlatform = 'ios' | 'android';

/** Platform enum as the API expects it (RegisterDeviceRequestDTO). */
type ApiDevicePlatform = 'IOS' | 'ANDROID';

export interface DeviceRegistration {
  id: string;
  token: string;
  platform: ApiDevicePlatform;
  createdAt: string;
}

export const devicesService = {
  /**
   * Registers the Expo push token. The API answers 201, or 409 when the token
   * is still active for another account on this phone (that account did not
   * log out); logout unregisters the token to avoid it.
   */
  async register(token: string, platform: DevicePlatform): Promise<DeviceRegistration> {
    const { data } = await api.post<DeviceRegistration>('/me/devices', {
      token,
      platform: platform.toUpperCase() as ApiDevicePlatform,
    });
    return data;
  },

  async unregister(token: string): Promise<void> {
    await api.delete(`/me/devices/${encodeURIComponent(token)}`);
  },
};
