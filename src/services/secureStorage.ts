import * as SecureStore from 'expo-secure-store';

const KEYS = {
  ACCESS_TOKEN: 'ford.accessToken',
  REFRESH_TOKEN: 'ford.refreshToken',
  PUSH_TOKEN: 'ford.pushToken',
} as const;

export const secureStorage = {
  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
  },

  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
  },

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, accessToken);
    await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refreshToken);
  },

  /** Expo push token registered in the backend for this session (removed on logout). */
  async getPushToken(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.PUSH_TOKEN);
  },

  async setPushToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(KEYS.PUSH_TOKEN, token);
  },

  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN);
    await SecureStore.deleteItemAsync(KEYS.PUSH_TOKEN);
  },
};
