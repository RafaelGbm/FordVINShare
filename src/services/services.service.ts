import { api } from './api';

export type ServiceType = 'REVIEW' | 'OIL_CHANGE' | 'WARRANTY' | 'REPAIR';

export interface ServiceRecord {
  id: string;
  vehicleId: string;
  dealership: string;
  serviceType: ServiceType;
  performedAt: string;
  totalAmount: number;
  summary: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
  numberOfElements?: number;
}

export interface ListServicesParams {
  vehicleId?: string;
  page?: number;
  size?: number;
}

/**
 * Shape the backend actually sends: the dealership and service type come as
 * an id + a human label instead of the single fields the screens read.
 */
interface RawServiceRecord {
  id: string;
  vehicleId: string;
  vehicleModel?: string;
  dealershipId: string;
  dealershipName: string;
  serviceTypeId: ServiceType;
  serviceTypeLabel?: string;
  performedAt: string;
  totalAmount: number;
  summary: string;
}

function normalizeService(raw: RawServiceRecord): ServiceRecord {
  return {
    id: raw.id,
    vehicleId: raw.vehicleId,
    dealership: raw.dealershipName,
    serviceType: raw.serviceTypeId,
    performedAt: raw.performedAt,
    totalAmount: raw.totalAmount,
    summary: raw.summary,
  };
}

export const servicesService = {
  async listMine(params: ListServicesParams = {}): Promise<PaginatedResponse<ServiceRecord>> {
    const { data } = await api.get<PaginatedResponse<RawServiceRecord>>('/me/services', {
      params,
    });
    return { ...data, content: data.content.map(normalizeService) };
  },

  async getById(serviceId: string): Promise<ServiceRecord> {
    const { data } = await api.get<RawServiceRecord>(`/services/${serviceId}`);
    return normalizeService(data);
  },

  async listByVehicle(vehicleId: string): Promise<PaginatedResponse<ServiceRecord>> {
    const { data } = await api.get<PaginatedResponse<RawServiceRecord>>(
      `/vehicles/${vehicleId}/services`
    );
    return { ...data, content: data.content.map(normalizeService) };
  },
};
