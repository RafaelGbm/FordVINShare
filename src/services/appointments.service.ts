import { api } from './api';
import { PaginatedResponse, ServiceType } from './services.service';

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

/**
 * Shape the backend actually sends: vehicle and dealership come as flat
 * id + name/model fields instead of the nested objects the screens read,
 * and the service type is split into an id + a human label.
 */
interface RawAppointmentSummary {
  id: string;
  status: AppointmentStatus;
  vehicleId: string;
  vehicleModel?: string;
  dealershipId: string;
  dealershipName: string;
  serviceTypeId: ServiceType;
  serviceTypeLabel?: string;
  scheduledAt: string;
  createdAt: string;
}

function normalizeAppointment(raw: RawAppointmentSummary): AppointmentSummary {
  return {
    id: raw.id,
    status: raw.status,
    vehicle: { id: raw.vehicleId, model: raw.vehicleModel ?? '' },
    dealership: { id: raw.dealershipId, name: raw.dealershipName },
    serviceType: raw.serviceTypeId,
    scheduledAt: raw.scheduledAt,
    createdAt: raw.createdAt,
  };
}

export const appointmentsService = {
  async listServiceTypes(): Promise<ServiceTypeOption[]> {
    const { data } = await api.get<ServiceTypeOption[]>('/service-types');
    return data;
  },

  async create(input: CreateAppointmentInput): Promise<AppointmentSummary> {
    const { data } = await api.post<RawAppointmentSummary>('/appointments', input);
    return normalizeAppointment(data);
  },

  /**
   * Unlike the other list endpoints, this one answers with a Spring `Page`
   * rather than a flat array. Normalising here keeps the page shape from
   * leaking into the screens, which iterate the result directly.
   */
  async listMine(status?: AppointmentStatus): Promise<AppointmentSummary[]> {
    const { data } = await api.get<
      RawAppointmentSummary[] | PaginatedResponse<RawAppointmentSummary>
    >('/me/appointments', {
      params: status ? { status } : undefined,
    });

    const list = Array.isArray(data) ? data : (data?.content ?? []);
    return list.map(normalizeAppointment);
  },

  async getById(appointmentId: string): Promise<AppointmentSummary> {
    const { data } = await api.get<RawAppointmentSummary>(`/appointments/${appointmentId}`);
    return normalizeAppointment(data);
  },

  async cancel(appointmentId: string): Promise<AppointmentSummary> {
    const { data } = await api.patch<RawAppointmentSummary>(
      `/appointments/${appointmentId}/cancel`
    );
    return normalizeAppointment(data);
  },

  async checkIn(appointmentId: string): Promise<AppointmentSummary> {
    const { data } = await api.patch<RawAppointmentSummary>(
      `/appointments/${appointmentId}/check-in`
    );
    return normalizeAppointment(data);
  },

  async complete(
    appointmentId: string,
    input: { totalAmount?: number; summary?: string } = {}
  ): Promise<AppointmentSummary> {
    const { data } = await api.patch<RawAppointmentSummary>(
      `/appointments/${appointmentId}/complete`,
      input
    );
    return normalizeAppointment(data);
  },
};
