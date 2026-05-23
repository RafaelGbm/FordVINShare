import { api } from './api';
import { PaginatedResponse } from './services.service';
import { WarrantyStatus } from './vehicles.service';

export type LeadStatus = 'NOVO' | 'EM_RISCO' | 'PERDIDO' | 'RECUPERADO';

export type LeadSegment = 'FIEL' | 'ECONOMICO' | 'ESQUECIDO' | 'ABANDONO';

export type LeadActionChannel = 'WHATSAPP' | 'EMAIL' | 'SMS' | 'CALL';

export interface Lead {
  id: string;
  customerName: string;
  vehicleModel: string;
  lastVisitAt: string | null;
  segment: LeadSegment;
  riskScore: number;
  reason: string;
  suggestedAction: string;
  // Backend doesn't send these yet; kept optional for forward-compat + demo fixtures.
  customerId?: string;
  cpfMasked?: string;
  vehiclePlate?: string;
  status?: LeadStatus;
  daysSinceLastVisit?: number;
  warrantyStatus?: WarrantyStatus;
  lastNpsScore?: number | null;
  recommendedAction?: string;
  updatedAt?: string;
}

/**
 * Backend doesn't expose `status` directly nor honour `?status=` filters.
 * Derive it from `riskScore` so the UI filters still work — same thresholds as the
 * heuristic in README.md (Score > 80 → PERDIDO, > 60 → EM_RISCO, < 20 → RECUPERADO).
 */
export function deriveLeadStatus(lead: Pick<Lead, 'riskScore' | 'status'>): LeadStatus {
  if (lead.status) return lead.status;
  if (lead.riskScore >= 80) return 'PERDIDO';
  if (lead.riskScore >= 60) return 'EM_RISCO';
  if (lead.riskScore < 20) return 'RECUPERADO';
  return 'NOVO';
}

/**
 * Backend returns `lastVisitAt` as date (or null); UI wants days-since-last-visit.
 * Returns null when the customer has never visited.
 */
export function daysSinceLastVisit(lead: Pick<Lead, 'lastVisitAt' | 'daysSinceLastVisit'>): number | null {
  if (lead.daysSinceLastVisit != null) return lead.daysSinceLastVisit;
  if (!lead.lastVisitAt) return null;
  const ms = Date.now() - new Date(lead.lastVisitAt).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

export interface ListLeadsParams {
  status?: LeadStatus;
  segment?: LeadSegment;
  dealershipId?: string;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface LeadActionInput {
  channel: LeadActionChannel;
  templateId: string;
  notes?: string;
}

export interface LeadActionResult {
  actionId: string;
  sentAt: string;
  channel: LeadActionChannel;
}

export const leadsService = {
  async list(params: ListLeadsParams = {}): Promise<PaginatedResponse<Lead>> {
    const { data } = await api.get<PaginatedResponse<Lead>>('/leads', { params });
    return data;
  },

  async getById(leadId: string): Promise<Lead> {
    const { data } = await api.get<Lead>(`/leads/${leadId}`);
    return data;
  },

  async createAction(leadId: string, input: LeadActionInput): Promise<LeadActionResult> {
    const { data } = await api.post<LeadActionResult>(`/leads/${leadId}/actions`, input);
    return data;
  },
};
