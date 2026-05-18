import { api } from './api';

export type WarrantyStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';

export interface Vehicle {
  id: string;
  model: string;
  version: string;
  year: number;
  plate: string;
  currentKm: number;
  warrantyStatus: WarrantyStatus;
}

export interface Warranty {
  vehicleId: string;
  status: WarrantyStatus;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  freeRevisionAvailable: boolean;
  nextFreeRevisionAt: string | null;
}

export interface MaintenanceAlert {
  type: string;
  title: string;
  kmThreshold: number;
  currentKm: number;
  kmRemaining: number;
}

export const vehiclesService = {
  async list(): Promise<Vehicle[]> {
    const { data } = await api.get<Vehicle[]>('/me/vehicles');
    return data;
  },

  async getById(vehicleId: string): Promise<Vehicle> {
    const { data } = await api.get<Vehicle>(`/vehicles/${vehicleId}`);
    return data;
  },

  async getWarranty(vehicleId: string): Promise<Warranty> {
    const { data } = await api.get<Warranty>(`/vehicles/${vehicleId}/warranty`);
    return data;
  },

  async getMaintenanceAlerts(vehicleId: string): Promise<MaintenanceAlert[]> {
    const { data } = await api.get<MaintenanceAlert[]>(
      `/vehicles/${vehicleId}/maintenance-alerts`
    );
    return data;
  },

  async updateOdometer(vehicleId: string, km: number): Promise<Vehicle> {
    const { data } = await api.patch<Vehicle>(`/vehicles/${vehicleId}/odometer`, {
      km,
    });
    return data;
  },
};
