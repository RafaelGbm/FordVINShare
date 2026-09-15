import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { authKeys, useLogout } from '../useAuth';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../utils/store';

jest.mock('../../services/auth.service', () => ({
  authService: { logout: jest.fn().mockResolvedValue(undefined) },
}));

jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));

describe('useLogout', () => {
  /**
   * Regression test: query keys like authKeys.me() carry no user id, so
   * they're shared across whoever is logged in. Before this fix, logging
   * out and back in as a different user could render the previous user's
   * cached /me response (e.g. the Home/Dashboard greeting) until that
   * query happened to refetch — reproduced live in the emulator: an
   * ADMIN login right after a CLIENT session showed the client's name.
   */
  it('clears the entire query cache on logout, not just the auth store', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(authKeys.me(), { fullName: 'João Silva' });
    expect(queryClient.getQueryData(authKeys.me())).toEqual({ fullName: 'João Silva' });

    useAuthStore.setState({ user: { id: '1' } as never, role: 'client' });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useLogout(), { wrapper });

    await act(async () => {
      await result.current();
    });

    expect(authService.logout).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().role).toBeNull();
    // The actual bug: without queryClient.clear(), this would still be set.
    expect(queryClient.getQueryData(authKeys.me())).toBeUndefined();
  });
});
