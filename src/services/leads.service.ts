import { api } from './api';
import { PaginatedResponse } from './services.service';
import { WarrantyStatus } from './vehicles.service';

export type LeadStatus = 'NOVO' | 'EM_RISCO' | 'PERDIDO' | 'RECUPERADO';

export type LeadSegment = 'FIEL' | 'ECONOMICO' | 'ESQUECIDO' | 'ABANDONO';

export type LeadActionChannel = 'WHATSAPP' | 'EMAIL' | 'SMS' | 'CALL';

export interface Lead {
  id: string;
  customerId: string;
  customerName: string;
  cpfMasked: string;
  vehicleModel: string;
  vehiclePlate: string;
  status: LeadStatus;
  segment: LeadSegment;
  riskScore: number;
  daysSinceLastVisit: number;
  warrantyStatus: WarrantyStatus;
  lastNpsScore: number | null;
  recommendedAction: string;
  updatedAt: string;
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
