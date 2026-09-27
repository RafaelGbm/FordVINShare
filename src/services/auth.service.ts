import { api, configureAuth } from './api';
import { devicesService } from './devices.service';
import { secureStorage } from './secureStorage';

export type UserRole = 'CLIENT' | 'ANALYST' | 'ADMIN';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  role: UserRole;
  userId: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface Me {
  userId: string;
  role: UserRole;
  fullName: string | null;
  email: string;
  phone: string | null;
  createdAt: string;
}

export const authService = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/login', payload);
    await secureStorage.setTokens(data.accessToken, data.refreshToken);
    return data;
  },

  async refresh(): Promise<string> {
    const refreshToken = await secureStorage.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token available');

    const { data } = await api.post<RefreshResponse>('/auth/refresh', {
      refreshToken,
    });
    await secureStorage.setTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  },

  /**
   * Ends the session on the server and on the device. The push token is
   * unregistered first (it needs the access token); then the refresh token is
   * revoked through the public /auth/logout. Local state is cleared even if
   * the server calls fail.
   */
  async logout(): Promise<void> {
    const [refreshToken, pushToken] = await Promise.all([
      secureStorage.getRefreshToken(),
      secureStorage.getPushToken(),
    ]);
    if (pushToken) {
      try {
        await devicesService.unregister(pushToken);
      } catch {
        // offline or already expired: the next login on this phone replaces it
      }
    }
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken });
      } catch {
        // even if the server call fails, clear local state
      }
    }
    await secureStorage.clear();
  },

  async getMe(): Promise<Me> {
    const { data } = await api.get<Me>('/me');
    return data;
  },
};

/**
 * Bootstrap the axios interceptors with the auth callbacks.
 * Call this once at app start (root layout), passing the redirect that should
 * fire when the refresh flow ultimately fails.
 */
export function bootstrapAuth(onLogout: () => void) {
  configureAuth({
    refresh: authService.refresh,
    onLogout,
  });
}
