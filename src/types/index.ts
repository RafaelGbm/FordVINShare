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
