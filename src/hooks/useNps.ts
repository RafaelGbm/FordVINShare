import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { npsService, SubmitNpsInput } from '../services/nps.service';

export const npsKeys = {
  all: ['nps'] as const,
  pending: () => [...npsKeys.all, 'pending'] as const,
  detail: (serviceId: string) => [...npsKeys.all, 'detail', serviceId] as const,
};

export function usePendingSurveys() {
  return useQuery({
    queryKey: npsKeys.pending(),
    queryFn: () => npsService.listPending(),
  });
}

export function useNps(serviceId: string | undefined) {
  return useQuery({
    queryKey: npsKeys.detail(serviceId ?? ''),
    queryFn: () => npsService.get(serviceId!),
    enabled: !!serviceId,
  });
}

export function useSubmitNps(serviceId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitNpsInput) => {
      if (!serviceId) throw new Error('serviceId is required');
      return npsService.submit(serviceId, input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: npsKeys.pending() });
      if (serviceId) {
        qc.invalidateQueries({ queryKey: npsKeys.detail(serviceId) });
      }
    },
  });
}
