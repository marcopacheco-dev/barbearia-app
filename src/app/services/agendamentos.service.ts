import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Agendamento } from '../models/agendamento.model';
import { AgendamentoDTO } from '../models/AgendamentoDTO.model';
import { BlacklistEntry } from '../models/blacklist.model';
import { environment } from '../../environments/environment';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AgendamentosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/agendamento`;

  /** Lista todos os agendamentos */
 private criarHeaders(): HttpHeaders {
  return new HttpHeaders({
    'Time-Zone': 'America/Sao_Paulo'
  });
}

listarAgendamentos(): Observable<AgendamentoDTO[]> {
  return this.http.get<AgendamentoDTO[]>(this.apiUrl, { headers: this.criarHeaders() });
}

  /** Cria um novo agendamento */
  criarAgendamento(dto: AgendamentoDTO): Observable<AgendamentoDTO> {
    console.log('JSON enviado para /Agendar:', dto);
    return this.http.post<AgendamentoDTO>(`${this.apiUrl}/Agendar`, dto);
  }

  /** Atualiza um agendamento existente */
  atualizarAgendamento(id: number, dto: AgendamentoDTO): Observable<void> {
    if (!id) {
      throw new Error('ID do agendamento é obrigatório para atualização.');
    }
    return this.http.put<void>(`${this.apiUrl}/${id}`, dto);
  }

  /** Cancela (exclui) um agendamento pelo ID */
  cancelarAgendamento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /** Busca todos os clientes na fila de espera */
  buscarFilaEspera(): Observable<Agendamento[]> {
    return this.http.get<Agendamento[]>(`${this.apiUrl}/fila-espera`);
  }

  /** Remove um cliente da fila de espera */
  removerDaFila(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/fila-espera/${id}`);
  }

  /** 🔒 Retorna a lista de clientes bloqueados (blacklist) */
  buscarBlacklist(): Observable<BlacklistEntry[]> {
    return this.http.get<BlacklistEntry[]>(`${this.apiUrl}/blacklist`);
  }

  /** 🔓 Remove um cliente da blacklist pelo ID */
  removerDaBlacklist(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/blacklist/${id}`);
  }

  /** Promove um cliente da fila de espera para um agendamento */
  promoverDaFilaParaAgenda(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/fila-espera/promover/${id}`, {});
  }

  /** Busca configuração da agenda */
  getConfiguracaoAgenda(): Observable<{ diasHabilitados: number[], horariosHabilitados: string[] }> {
    return this.http.get<{ diasHabilitados: number[], horariosHabilitados: string[] }>('/api/agenda/config');
  }
}