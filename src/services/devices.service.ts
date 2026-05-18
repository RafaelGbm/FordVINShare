import { api } from './api';

export type DevicePlatform = 'ios' | 'android';

export interface RegisterDeviceInput {
  expoPushToken: string;
  platform: DevicePlatform;
  appVersion: string;
  consentAt: string;
}

export interface DeviceRegistration {
  id: string;
  expoPushToken: string;
  platform: DevicePlatform;
  appVersion: string;
  registeredAt: string;
}

export const devicesService = {
  async register(input: RegisterDeviceInput): Promise<DeviceRegistration> {
    const { data } = await api.post<DeviceRegistration>('/me/devices', input);
    return data;
  },

  async unregister(expoPushToken: string): Promise<void> {
    await api.delete(`/me/devices/${encodeURIComponent(expoPushToken)}`);
  },
};
