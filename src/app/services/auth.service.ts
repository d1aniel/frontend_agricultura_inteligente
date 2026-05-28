import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AuthTokenResponse,
  AuthUser,
  ChangeTemporaryPasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload
} from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly authUrl = `${environment.apiUrl}/api_usuarios/auth`;

  private readonly tokenKey = 'agro_auth_token';
  private readonly userKey = 'agro_auth_user';
  private readonly lastActivityKey = 'agro_auth_last_activity';
  private readonly sessionTimeoutMs = 30 * 60 * 1000;

  private readonly userSubject = new BehaviorSubject<AuthUser | null>(this.loadUser());
  readonly user$ = this.userSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  get token(): string | null {
    if (!this.hasStorage()) {
      return null;
    }
    if (this.isSessionExpired()) {
      this.clearSession();
      return null;
    }
    this.touchSession();
    return sessionStorage.getItem(this.tokenKey);
  }

  get isAuthenticated(): boolean {
    return this.token !== null;
  }

  get currentUser(): AuthUser | null {
    return this.userSubject.value;
  }

  get hasAdministrativeRole(): boolean {
    const user = this.currentUser;

    if (!user) {
      return false;
    }

    if (user.es_administrador_o_auditor === true) {
      return true;
    }

    return (user.roles ?? []).some((role) => ['administrador', 'admin', 'auditor'].includes(role.toLowerCase()));
  }

  get hasActiveRole(): boolean {
    const user = this.currentUser;

    if (!user) {
      return false;
    }

    return user.tiene_rol_activo === true || user.es_administrador_o_auditor === true || (user.roles ?? []).length > 0;
  }

  register(payload: RegisterPayload): Observable<AuthTokenResponse> {
    return this.http.post<AuthTokenResponse>(`${this.authUrl}/registro/`, payload).pipe(
      tap((response) => this.saveSession(response)),
      catchError((error) => {
        console.error('Error registering user:', error);
        return throwError(() => error);
      })
    );
  }

  login(payload: LoginPayload): Observable<AuthTokenResponse> {
    return this.http.post<AuthTokenResponse>(`${this.authUrl}/login/`, payload).pipe(
      tap((response) => this.saveSession(response)),
      catchError((error) => {
        console.error('Error logging in:', error);
        return throwError(() => error);
      })
    );
  }

  me(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.authUrl}/me/`).pipe(
      tap((user) => this.saveUser(user)),
      catchError((error) => {
        console.error('Error loading current user:', error);
        return throwError(() => error);
      })
    );
  }

  forgotPassword(payload: ForgotPasswordPayload): Observable<{ detail: string }> {
    return this.http.post<{ detail: string }>(`${this.authUrl}/olvide-password/`, payload);
  }

  changeTemporaryPassword(payload: ChangeTemporaryPasswordPayload): Observable<{ detail: string; usuario: AuthUser }> {
    return this.http.post<{ detail: string; usuario: AuthUser }>(`${this.authUrl}/cambiar-password-temporal/`, payload).pipe(
      tap((response) => this.saveUser(response.usuario))
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.authUrl}/logout/`, {}).pipe(
      tap(() => this.clearSession()),
      catchError((error) => {
        this.clearSession();
        return throwError(() => error);
      })
    );
  }

  clearSession(): void {
    if (this.hasStorage()) {
      sessionStorage.removeItem(this.tokenKey);
      sessionStorage.removeItem(this.userKey);
      sessionStorage.removeItem(this.lastActivityKey);
    }
    this.userSubject.next(null);
  }

  private saveSession(response: AuthTokenResponse): void {
    if (this.hasStorage()) {
      sessionStorage.setItem(this.tokenKey, response.token);
      this.touchSession();
    }
    this.saveUser(response.usuario);
  }

  private saveUser(user: AuthUser): void {
    if (this.hasStorage()) {
      sessionStorage.setItem(this.userKey, JSON.stringify(user));
    }
    this.userSubject.next(user);
  }

  private loadUser(): AuthUser | null {
    if (!this.hasStorage()) {
      return null;
    }

    if (this.isSessionExpired()) {
      this.clearStoredSession();
      return null;
    }

    const rawUser = sessionStorage.getItem(this.userKey);
    return rawUser ? (JSON.parse(rawUser) as AuthUser) : null;
  }

  private hasStorage(): boolean {
    return typeof sessionStorage !== 'undefined';
  }

  private touchSession(): void {
    if (this.hasStorage()) {
      sessionStorage.setItem(this.lastActivityKey, String(Date.now()));
    }
  }

  private isSessionExpired(): boolean {
    if (!this.hasStorage()) {
      return true;
    }

    const token = sessionStorage.getItem(this.tokenKey);
    if (!token) {
      return false;
    }

    const lastActivity = Number(sessionStorage.getItem(this.lastActivityKey) ?? 0);
    return lastActivity > 0 && Date.now() - lastActivity > this.sessionTimeoutMs;
  }

  private clearStoredSession(): void {
    if (this.hasStorage()) {
      sessionStorage.removeItem(this.tokenKey);
      sessionStorage.removeItem(this.userKey);
      sessionStorage.removeItem(this.lastActivityKey);
    }
  }
}
