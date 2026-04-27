import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

interface AuthResponse {
  success: true;
  token: string;
  user: { id: string; email: string; fullName: string | null };
}

interface TokenPayload {
  sub: string;
  email: string;
  fullName?: string | null;
  exp?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly TOKEN_KEY = 'pw_token';

  constructor(private readonly http: HttpClient) {}

  register(email: string, password: string, fullName?: string): Observable<void> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/register`, { email, password, fullName })
      .pipe(tap(res => this.storeToken(res.token))) as unknown as Observable<void>;
  }

  login(email: string, password: string): Observable<void> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(tap(res => this.storeToken(res.token))) as unknown as Observable<void>;
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    const payload = this.decodeToken();
    if (!payload) return false;
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      this.logout();
      return false;
    }
    return true;
  }

  getUserInfo(): { email: string; fullName: string | null } | null {
    const payload = this.decodeToken();
    if (!payload) return null;
    return { email: payload.email ?? '', fullName: payload.fullName ?? null };
  }

  getUserInitials(): string {
    const info = this.getUserInfo();
    if (!info) return 'Me';
    if (info.fullName) {
      return info.fullName.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
    }
    return info.email.slice(0, 2).toUpperCase();
  }

  private storeToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private decodeToken(): TokenPayload | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(b64)) as TokenPayload;
    } catch {
      return null;
    }
  }
}
