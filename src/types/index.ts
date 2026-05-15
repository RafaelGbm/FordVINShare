export type UserRole = 'client' | 'analyst';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  cpf?: string;
  phone?: string;
  created_at: string;
}

export interface Vehicle {
  id: string;
  user_id: string;
  vin: string;
  model: string;
  year: number;
  km: number;
  warranty_status: 'active' | 'expiring_soon' | 'expired';
  warranty_expiry_date: string;
  created_at: string;
}

export interface Service {
  id: string;
  vehicle_id: string;
  type: 'revision' | 'oil_change' | 'warranty' | 'repair';
  dealer_id: string;
  scheduled_date: string;
  completed_date?: string;
  description: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
}

export interface Dealer {
  id: string;
  name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  phone: string;
  services_available: string[];
  business_hours: string;
  created_at: string;
}

export interface NPS {
  id: string;
  service_id: string;
  user_id: string;
  score: number;
  comment: string;
  category: string;
  created_at: string;
}

export interface Points {
  id: string;
  user_id: string;
  balance: number;
  earned_from?: string;
  created_at: string;
}

export interface Lead {
  id: string;
  user_id: string;
  status: 'in_risk' | 'lost' | 'new';
  risk_score: number;
  last_interaction: string;
  suggested_action: string;
  created_at: string;
}

export interface Segment {
  name: 'Fiel' | 'Em Risco' | 'Perdido' | 'Novo';
  color: string;
  description: string;
  user_count: number;
  recovery_metric: number;
}
