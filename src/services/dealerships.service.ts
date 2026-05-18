import { api } from './api';
import { ServiceType } from './services.service';

export interface Dealership {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  lat: number;
  lng: number;
  distanceKm: number;
  openingHours: string;
  services: ServiceType[];
}

export interface AvailabilitySlot {
  time: string;
  available: boolean;
}

export interface Availability {
  date: string;
  slots: AvailabilitySlot[];
}

export interface ListDealershipsParams {
  lat?: number;
  lng?: number;
  radiusKm?: number;
  service?: ServiceType;
}

export const dealershipsService = {
  async list(params: ListDealershipsParams = {}): Promise<Dealership[]> {
    const { data } = await api.get<Dealership[]>('/dealerships', { params });
    return data;
  },

  async getById(dealershipId: string): Promise<Dealership> {
    const { data } = await api.get<Dealership>(`/dealerships/${dealershipId}`);
    return data;
  },

  async getAvailability(
    dealershipId: string,
    serviceType: ServiceType,
    date: string
  ): Promise<Availability> {
    const { data } = await api.get<Availability>(
      `/dealerships/${dealershipId}/availability`,
      { params: { serviceType, date } }
    );
    return data;
  },
};
