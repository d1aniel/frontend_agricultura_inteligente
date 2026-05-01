import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AuthTokenResponse,
  AuthUser,
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

  private readonly userSubject = new BehaviorSubject<AuthUser | null>(this.loadUser());
  readonly user$ = this.userSubject.asObservable();

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
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
    this.userSubject.next(null);
  }

  private saveSession(response: AuthTokenResponse): void {
    if (this.hasStorage()) {
      localStorage.setItem(this.tokenKey, response.token);
    }
    this.saveUser(response.usuario);
  }

  private saveUser(user: AuthUser): void {
    if (this.hasStorage()) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
    this.userSubject.next(user);
  }

  private loadUser(): AuthUser | null {
    if (!this.hasStorage()) {
      return null;
    }

    const rawUser = localStorage.getItem(this.userKey);
    return rawUser ? (JSON.parse(rawUser) as AuthUser) : null;
  }

  private hasStorage(): boolean {
    return typeof localStorage !== 'undefined';
  }
}
