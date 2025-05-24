import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  /** Lista todos os agendamentos */
  listarAgendamentos(): Observable<Agendamento[]> {
    return this.http.get<Agendamento[]>(this.apiUrl);
  }

  /** Cria um novo agendamento */
  criarAgendamento(dto: AgendamentoDTO): Observable<any> {
    console.log('JSON enviado para /Agendar:', dto);
    return this.http.post<any>(`${this.apiUrl}/Agendar`, dto);
  }

  /** Atualiza um agendamento existente */
  atualizarAgendamento(agendamento: Agendamento): Observable<void> {
    if (!agendamento.id) {
      throw new Error('ID do agendamento é obrigatório para atualização.');
    }
    return this.http.put<void>(`${this.apiUrl}/${agendamento.id}`, agendamento);
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
}
