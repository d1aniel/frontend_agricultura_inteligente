export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  nombre_completo: string;
  is_active: boolean;
  roles?: string[];
  tiene_rol_activo?: boolean;
  es_administrador_o_auditor?: boolean;
  requiere_cambio_password?: boolean;
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

export interface ForgotPasswordPayload {
  identificador: string;
}

export interface ChangeTemporaryPasswordPayload {
  password_actual: string;
  nueva_password: string;
}
