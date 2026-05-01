export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  nombre_completo: string;
  is_active: boolean;
  tiene_2fa: boolean;
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

export interface OtpPayload {
  challenge_id: string;
  codigo: string;
  nombre_dispositivo?: string;
}

export interface AuthTokenResponse {
  token: string;
  tipo: 'Token';
  usuario: AuthUser;
}

export interface AuthChallengeResponse {
  usuario?: AuthUser;
  requiere_2fa: true;
  challenge_id: string;
  expira_en: string;
  mensaje: string;
  '2fa_pendiente'?: boolean;
}

export type AuthMode = 'register' | 'login';

export interface PendingChallenge {
  mode: AuthMode;
  challengeId: string;
  expiresAt: string;
  message: string;
  username?: string;
  deviceName?: string;
}
