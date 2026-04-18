import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

interface AuthResponse {
  success: true;
  token: string;
  user: { id: string; email: string; fullName: string | null };
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
    return !!this.getToken();
  }

  private storeToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }
}
