import { create } from 'zustand';
import { User, Vehicle, UserRole } from '../types';

interface AuthStore {
  user: User | null;
  role: UserRole | null;
  vehicles: Vehicle[];
  isLoading: boolean;
  setUser: (user: User | null, role: UserRole) => void;
  setVehicles: (vehicles: Vehicle[]) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  role: null,
  vehicles: [],
  isLoading: false,

  setUser: (user, role) =>
    set({ user, role }),

  setVehicles: (vehicles) =>
    set({ vehicles }),

  setLoading: (isLoading) =>
    set({ isLoading }),

  logout: () =>
    set({ user: null, role: null, vehicles: [] }),

  switchRole: (role) =>
    set({ role }),
}));

interface MockUser {
  id: string;
  email: string;
  name: string;
  cpf?: string;
  phone?: string;
}

interface MockVehicle {
  id: string;
  model: string;
  year: number;
  vin: string;
  km: number;
  warranty_expiry_date: string;
}

const MOCK_CLIENTS: Record<string, { user: MockUser; vehicle: MockVehicle }> = {
  client1: {
    user: {
      id: 'user_1',
      email: 'joao@example.com',
      name: 'João Silva',
      cpf: '123.456.789-00',
      phone: '(11) 98765-4321',
    },
    vehicle: {
      id: 'vehicle_1',
      model: 'Fiesta',
      year: 2022,
      vin: '9BWHE21H505068124',
      km: 45000,
      warranty_expiry_date: '2025-12-15',
    },
  },
  client2: {
    user: {
      id: 'user_2',
      email: 'maria@example.com',
      name: 'Maria Santos',
      cpf: '987.654.321-11',
      phone: '(21) 99876-5432',
    },
    vehicle: {
      id: 'vehicle_2',
      model: 'EcoSport',
      year: 2021,
      vin: '9BWHE21H505068125',
      km: 68000,
      warranty_expiry_date: '2024-08-20',
    },
  },
};

const MOCK_ANALYST = {
  id: 'analyst_1',
  email: 'analyst@ford.com',
  name: 'Ana Oliveira',
  cpf: '555.666.777-88',
  phone: '(11) 3000-0000',
};

export const getMockUser = (clientKey: string) => {
  return MOCK_CLIENTS[clientKey] || MOCK_CLIENTS.client1;
};

export const getMockAnalyst = () => {
  return MOCK_ANALYST;
};
