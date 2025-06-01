import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'https://barbeariaapi-production.up.railway.app/auth';
  private tokenKey = 'token';

  constructor(private http: HttpClient) {}

  // Método de login
  login(credentials: { username: string; password: string }): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.saveToken(response.token))
    );
  }

  // Salvar o token no localStorage
  private saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // Remover o token
  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  // Recuperar o token do localStorage
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Verificar se o token existe e se é válido
  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && !this.isTokenExpired(token);
  }

  // Verificar se o token expirou
  private isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      if (payload.exp) {
        const expirationDate = new Date(payload.exp * 1000);
        return expirationDate < new Date();
      }
    } catch (error) {
      console.error('Erro ao decodificar o token', error);
    }
    return true; // Considera expirado se der erro na verificação
  }

  // Decodificar o token JWT
  private decodeToken(token: string): any {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Token inválido');
    }
    const decoded = atob(parts[1]);
    return JSON.parse(decoded);
  }

  // Logout automático se o token for inválido ou expirado
  ensureAuthenticated(): void {
    if (!this.isAuthenticated()) {
      this.logout();
    }
  }
}
