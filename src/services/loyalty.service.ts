import { api } from './api';
import { PaginatedResponse } from './services.service';

export interface LoyaltyBalance {
  balance: number;
  expiringIn30Days: number;
}

export type LoyaltyTransactionType = 'EARN' | 'SPEND';

export interface LoyaltyTransaction {
  id: string;
  type: LoyaltyTransactionType;
  label: string;
  points: number; // signed (positive earn, negative spend)
  createdAt: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
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
    const { data } = await api.get<PaginatedResponse<LoyaltyTransaction>>(
      '/me/loyalty/transactions',
      { params }
    );
    return data;
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
