import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = '/api/Auth';
  private tokenKey = 'auth_token'; // Chave para armazenar o token no localStorage

  constructor(private http: HttpClient) {}

  // Método de login que salva o token no localStorage
  login(credentials: { username: string; password: string }): Observable<{ token: string }> {
  return this.http.post<{ token: string }>(`${this.apiUrl}/login`, credentials).pipe(
    tap(response => this.saveToken(response.token))  // salva o token aqui
  );
}

  // Salvar o token no localStorage
  private saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // Remover o token do localStorage
  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  // Recuperar o token do localStorage
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Verificar se o token existe e se não está expirado
  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && !this.isTokenExpired(token);
  }

  // Verifica se o token JWT expirou
  private isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      if (payload && payload.exp) {
        const expirationDate = new Date(payload.exp * 1000);
        return expirationDate < new Date();
      }
      return true; // Se não tiver exp, considera expirado
    } catch (error) {
      console.error('Erro ao decodificar o token:', error);
      return true; // Se erro, considera expirado
    }
  }

  // Decodifica o payload do token JWT
  private decodeToken(token: string): any {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Token JWT inválido');
    }
    const payload = parts[1];
    // Base64url decode
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decodedPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(decodedPayload);
  }

  // Retorna o payload do token (útil para pegar dados do usuário)
  getTokenPayload(): any | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return this.decodeToken(token);
    } catch {
      return null;
    }
  }

  // Logout automático se o token for inválido ou expirado
  ensureAuthenticated(): void {
    if (!this.isAuthenticated()) {
      this.logout();
    }
  }
}