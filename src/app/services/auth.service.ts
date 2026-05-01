import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AuthChallengeResponse,
  AuthTokenResponse,
  AuthUser,
  LoginPayload,
  OtpPayload,
  PendingChallenge,
  RegisterPayload
} from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // ✅ URL base dinámica (Railway)
  private readonly authUrl = `${environment.apiUrl}/api_usuarios/auth`;

  private readonly tokenKey = 'agro_auth_token';
  private readonly userKey = 'agro_auth_user';
  private readonly challengeKey = 'agro_auth_challenge';

  private readonly userSubject = new BehaviorSubject<AuthUser | null>(this.loadUser());
  readonly user$ = this.userSubject.asObservable();

  private readonly challengeSubject = new BehaviorSubject<PendingChallenge | null>(this.loadChallenge());
  readonly challenge$ = this.challengeSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  get token(): string | null {
    if (!this.hasStorage()) {
      return null;
    }
    return localStorage.getItem(this.tokenKey);
  }

  get isAuthenticated(): boolean {
    return this.token !== null;
  }

  get currentUser(): AuthUser | null {
    return this.userSubject.value;
  }

  get currentChallenge(): PendingChallenge | null {
    return this.challengeSubject.value;
  }

  // ✅ REGISTRO
  register(payload: RegisterPayload): Observable<AuthChallengeResponse> {
    return this.http.post<AuthChallengeResponse>(`${this.authUrl}/registro/`, payload).pipe(
      tap((response) => {
        this.saveChallenge({
          mode: 'register',
          challengeId: response.challenge_id,
          expiresAt: response.expira_en,
          message: response.mensaje,
          username: payload.username
        });
      }),
      catchError((error) => {
        console.error('Error registering user:', error);
        return throwError(() => error);
      })
    );
  }

  // ✅ LOGIN
  login(payload: LoginPayload): Observable<AuthChallengeResponse> {
    return this.http.post<AuthChallengeResponse>(`${this.authUrl}/login/`, payload).pipe(
      tap((response) => {
        this.saveChallenge({
          mode: 'login',
          challengeId: response.challenge_id,
          expiresAt: response.expira_en,
          message: response.mensaje,
          username: payload.username,
          deviceName: payload.nombre_dispositivo
        });
      }),
      catchError((error) => {
        console.error('Error logging in:', error);
        return throwError(() => error);
      })
    );
  }

  // ✅ VERIFICAR OTP
  verifyOtp(payload: OtpPayload): Observable<AuthTokenResponse> {
    const challenge = this.challengeSubject.value;
    const endpoint = challenge?.mode === 'register'
      ? 'registro/confirmar-2fa'
      : 'login/2fa';

    return this.http.post<AuthTokenResponse>(`${this.authUrl}/${endpoint}/`, payload).pipe(
      tap((response) => this.saveSession(response)),
      catchError((error) => {
        console.error('Error verifying OTP:', error);
        return throwError(() => error);
      })
    );
  }

  // ✅ USUARIO ACTUAL
  me(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.authUrl}/me/`).pipe(
      tap((user) => this.saveUser(user)),
      catchError((error) => {
        console.error('Error loading current user:', error);
        return throwError(() => error);
      })
    );
  }

  // ✅ LOGOUT
  logout(): Observable<void> {
    return this.http.post<void>(`${this.authUrl}/logout/`, {}).pipe(
      tap(() => this.clearSession()),
      catchError((error) => {
        this.clearSession();
        return throwError(() => error);
      })
    );
  }

  // --------------------------
  // 🔹 MANEJO DE SESIÓN
  // --------------------------

  clearSession(): void {
    if (this.hasStorage()) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
      localStorage.removeItem(this.challengeKey);
    }
    this.userSubject.next(null);
    this.challengeSubject.next(null);
  }

  clearChallenge(): void {
    if (this.hasStorage()) {
      localStorage.removeItem(this.challengeKey);
    }
    this.challengeSubject.next(null);
  }

  private saveSession(response: AuthTokenResponse): void {
    if (this.hasStorage()) {
      localStorage.setItem(this.tokenKey, response.token);
    }
    this.saveUser(response.usuario);
    this.clearChallenge();
  }

  private saveUser(user: AuthUser): void {
    if (this.hasStorage()) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
    this.userSubject.next(user);
  }

  private saveChallenge(challenge: PendingChallenge): void {
    if (this.hasStorage()) {
      localStorage.setItem(this.challengeKey, JSON.stringify(challenge));
    }
    this.challengeSubject.next(challenge);
  }

  private loadUser(): AuthUser | null {
    if (!this.hasStorage()) {
      return null;
    }

    const rawUser = localStorage.getItem(this.userKey);
    return rawUser ? (JSON.parse(rawUser) as AuthUser) : null;
  }

  private loadChallenge(): PendingChallenge | null {
    if (!this.hasStorage()) {
      return null;
    }

    const rawChallenge = localStorage.getItem(this.challengeKey);
    return rawChallenge ? (JSON.parse(rawChallenge) as PendingChallenge) : null;
  }

  private hasStorage(): boolean {
    return typeof localStorage !== 'undefined';
  }
}