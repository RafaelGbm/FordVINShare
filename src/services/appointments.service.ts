import { api } from './api';
import { ServiceType } from './services.service';

export type AppointmentStatus =
  | 'SCHEDULED'
  | 'CHECKED_IN'
  | 'COMPLETED'
  | 'CANCELED'
  | 'NO_SHOW';

export interface ServiceTypeOption {
  id: ServiceType;
  label: string;
  freeWithWarranty: boolean;
}

export interface AppointmentSummary {
  id: string;
  status: AppointmentStatus;
  vehicle: { id: string; model: string };
  dealership: { id: string; name: string };
  serviceType: ServiceType;
  scheduledAt: string;
  createdAt: string;
}

export interface CreateAppointmentInput {
  vehicleId: string;
  dealershipId: string;
  serviceTypeId: ServiceType;
  scheduledAt: string; // ISO 8601 with timezone
  notes?: string;
}

export const appointmentsService = {
  async listServiceTypes(): Promise<ServiceTypeOption[]> {
    const { data } = await api.get<ServiceTypeOption[]>('/service-types');
    return data;
  },

  async create(input: CreateAppointmentInput): Promise<AppointmentSummary> {
    const { data } = await api.post<AppointmentSummary>('/appointments', input);
    return data;
  },

  async listMine(status?: AppointmentStatus): Promise<AppointmentSummary[]> {
    const { data } = await api.get<AppointmentSummary[]>('/me/appointments', {
      params: status ? { status } : undefined,
    });
    return data;
  },

  async getById(appointmentId: string): Promise<AppointmentSummary> {
    const { data } = await api.get<AppointmentSummary>(`/appointments/${appointmentId}`);
    return data;
  },

  async cancel(appointmentId: string): Promise<AppointmentSummary> {
    const { data } = await api.patch<AppointmentSummary>(
      `/appointments/${appointmentId}/cancel`
    );
    return data;
  },
};
