import { useQuery } from '@tanstack/react-query';

import { authService } from '../services/auth.service';

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
