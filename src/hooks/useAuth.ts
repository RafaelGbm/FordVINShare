import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

import { authService } from '../services/auth.service';
import { useAuthStore } from '../utils/store';

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

export function useMe(enabled = true) {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: () => authService.getMe(),
    enabled,
    staleTime: 5 * 60_000,
  });
}

/**
 * Centralizes sign-out: clears tokens, local auth state, the React Query
 * cache, and navigates back to login.
 *
 * The cache clear matters — `authKeys.me()` (and most other query keys in
 * this app) carry no user id, so they're shared across whoever is logged
 * in. Without it, a login right after a logout can render the previous
 * user's cached data (e.g. the Home/Dashboard greeting) until that query
 * happens to refetch, up to its `staleTime`.
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const clearAuthStore = useAuthStore((state) => state.logout);

  return async () => {
    await authService.logout();
    clearAuthStore();
    queryClient.clear();
    router.replace('/');
  };
}
