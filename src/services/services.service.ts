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
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ListServicesParams {
  vehicleId?: string;
  page?: number;
  size?: number;
}

export const servicesService = {
  async listMine(params: ListServicesParams = {}): Promise<PaginatedResponse<ServiceRecord>> {
    const { data } = await api.get<PaginatedResponse<ServiceRecord>>('/me/services', {
      params,
    });
    return data;
  },

  async getById(serviceId: string): Promise<ServiceRecord> {
    const { data } = await api.get<ServiceRecord>(`/services/${serviceId}`);
    return data;
  },

  async listByVehicle(vehicleId: string): Promise<PaginatedResponse<ServiceRecord>> {
    const { data } = await api.get<PaginatedResponse<ServiceRecord>>(
      `/vehicles/${vehicleId}/services`
    );
    return data;
  },
};
