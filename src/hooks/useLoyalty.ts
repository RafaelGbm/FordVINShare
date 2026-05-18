import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { loyaltyService } from '../services/loyalty.service';

export const loyaltyKeys = {
  all: ['loyalty'] as const,
  balance: () => [...loyaltyKeys.all, 'balance'] as const,
  transactions: (page: number, size: number) =>
    [...loyaltyKeys.all, 'transactions', page, size] as const,
  rewards: () => [...loyaltyKeys.all, 'rewards'] as const,
};

export function useLoyaltyBalance() {
  return useQuery({
    queryKey: loyaltyKeys.balance(),
    queryFn: () => loyaltyService.getBalance(),
  });
}

export function useLoyaltyTransactions(page = 0, size = 10) {
  return useQuery({
    queryKey: loyaltyKeys.transactions(page, size),
    queryFn: () => loyaltyService.listTransactions({ page, size }),
  });
}

export function useLoyaltyRewards() {
  return useQuery({
    queryKey: loyaltyKeys.rewards(),
    queryFn: () => loyaltyService.listRewards(),
    staleTime: 60_000,
  });
}

export function useRedeemReward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rewardId: string) => loyaltyService.redeem(rewardId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: loyaltyKeys.balance() });
      qc.invalidateQueries({ queryKey: loyaltyKeys.all });
    },
  });
}
