export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  nombre_completo: string;
  is_active: boolean;
}

export interface RegisterPayload {
  username: string;
  password: string;
  email: string;
  first_name?: string;
  last_name?: string;
  telefono?: string;
}

export interface LoginPayload {
  username: string;
  password: string;
  nombre_dispositivo?: string;
}

export interface AuthTokenResponse {
  token: string;
  tipo: 'Token';
  usuario: AuthUser;
}
