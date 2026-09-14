import { api } from './api';
import { PaginatedResponse } from './services.service';

export interface LoyaltyBalance {
  balance: number;
  expiringIn30Days: number;
}

export type LoyaltyTransactionType = 'EARN' | 'REDEEM' | 'EXPIRE' | 'ADJUSTMENT';

export interface LoyaltyTransaction {
  id: string;
  type: LoyaltyTransactionType;
  label: string;
  points: number; // signed here: positive for EARN/ADJUSTMENT, negative for REDEEM/EXPIRE
  createdAt: string;
}

/**
 * Shape the backend actually sends: `points` is always a positive magnitude,
 * there is no `label`, and the transaction carries whichever source id
 * applies to its `type` instead.
 */
interface RawLoyaltyTransaction {
  id: string;
  type: LoyaltyTransactionType;
  points: number;
  sourceServiceId?: string | null;
  sourceRewardId?: string | null;
  rewardName?: string | null;
  voucherCode?: string | null;
  createdAt: string;
}

const DEBIT_TYPES = new Set<LoyaltyTransactionType>(['REDEEM', 'EXPIRE']);

const LABEL_BY_TYPE: Record<LoyaltyTransactionType, string> = {
  EARN: 'Pontos por serviço',
  REDEEM: 'Resgate',
  EXPIRE: 'Pontos expirados',
  ADJUSTMENT: 'Ajuste de saldo',
};

function normalizeTransaction(raw: RawLoyaltyTransaction): LoyaltyTransaction {
  const magnitude = Math.abs(raw.points);
  return {
    id: raw.id,
    type: raw.type,
    label: raw.rewardName ?? LABEL_BY_TYPE[raw.type],
    points: DEBIT_TYPES.has(raw.type) ? -magnitude : magnitude,
    createdAt: raw.createdAt,
  };
}

export interface Reward {
  id: string;
  name: string;
  description: string | null;
  pointsCost: number;
  category?: string;
  imageUrl?: string;
}

export interface RedeemResponse {
  transactionId: string;
  rewardId: string;
  rewardName: string;
  voucherCode: string;
  expiresAt: string;
  pointsSpent: number;
  newBalance: number;
}

export const loyaltyService = {
  async getBalance(): Promise<LoyaltyBalance> {
    const { data } = await api.get<LoyaltyBalance>('/me/loyalty/balance');
    return data;
  },

  async listTransactions(
    params: { page?: number; size?: number } = {}
  ): Promise<PaginatedResponse<LoyaltyTransaction>> {
    const { data } = await api.get<PaginatedResponse<RawLoyaltyTransaction>>(
      '/me/loyalty/transactions',
      { params }
    );
    return { ...data, content: data.content.map(normalizeTransaction) };
  },

  async listRewards(): Promise<Reward[]> {
    const { data } = await api.get<Reward[]>('/loyalty/rewards');
    return data;
  },

  async redeem(rewardId: string): Promise<RedeemResponse> {
    const { data } = await api.post<RedeemResponse>('/me/loyalty/redeem', { rewardId });
    return data;
  },
};
