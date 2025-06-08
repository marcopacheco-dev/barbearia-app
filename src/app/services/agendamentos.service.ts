import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Agendamento } from '../models/agendamento.model';
import { AgendamentoDTO } from '../models/AgendamentoDTO.model';
import { BlacklistEntry } from '../models/blacklist.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AgendamentosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/agendamento`;

  /**
   * Cria os headers base com o token JWT, se disponível.
   */
  private criarHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json', // Adicione Content-Type padrão
      'Time-Zone': 'America/Sao_Paulo'
    });

    const token = localStorage.getItem('jwt_token');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /** Lista todos os agendamentos */
  listarAgendamentos(): Observable<AgendamentoDTO[]> {
    return this.http.get<AgendamentoDTO[]>(this.apiUrl, { headers: this.criarHeaders() });
  }

  /** Cria um novo agendamento */
  criarAgendamento(dto: AgendamentoDTO): Observable<AgendamentoDTO> {
    return this.http.post<AgendamentoDTO>(`${this.apiUrl}/Agendar`, dto, { headers: this.criarHeaders() });
  }

  /** Atualiza um agendamento existente */
  atualizarAgendamento(id: number, dto: AgendamentoDTO): Observable<void> {
    if (!id) {
      throw new Error('ID do agendamento é obrigatório para atualização.');
    }
    return this.http.put<void>(`${this.apiUrl}/${id}`, dto, { headers: this.criarHeaders() });
  }

  /** Cancela (exclui) um agendamento pelo ID */
  cancelarAgendamento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.criarHeaders() });
  }

  /** Busca todos os clientes na fila de espera */
  buscarFilaEspera(): Observable<Agendamento[]> {
    return this.http.get<Agendamento[]>(`${this.apiUrl}/fila-espera`, { headers: this.criarHeaders() });
  }

  /** Remove um cliente da fila de espera */
  removerDaFila(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/fila-espera/${id}`, { headers: this.criarHeaders() });
  }

  /** 🔒 Retorna a lista de clientes bloqueados (blacklist) */
  buscarBlacklist(): Observable<BlacklistEntry[]> {
    return this.http.get<BlacklistEntry[]>(`${this.apiUrl}/blacklist`, { headers: this.criarHeaders() });
  }

  /** 🔓 Remove um cliente da blacklist pelo ID */
  removerDaBlacklist(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/blacklist/${id}`, { headers: this.criarHeaders() });
  }

  /** Promove um cliente da fila de espera para um agendamento */
  promoverDaFilaParaAgenda(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/fila-espera/promover/${id}`, {}, { headers: this.criarHeaders() });
  }

  /** Busca configuração da agenda */
  getConfiguracaoAgenda(): Observable<{ diasHabilitados: number[], horariosHabilitados: string[] }> {
    return this.http.get<{ diasHabilitados: number[], horariosHabilitados: string[] }>('/api/agenda/config', { headers: this.criarHeaders() });
  }
}