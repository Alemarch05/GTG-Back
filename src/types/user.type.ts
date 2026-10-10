export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'USER' | 'ADMIN';
  created_at: Date;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password?: string;
  role?: 'USER' | 'ADMIN';
}