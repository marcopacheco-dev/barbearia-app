import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Agendamento } from '../models/agendamento.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AgendamentosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5273/api/agendamento';

  

  /**
   * Retorna a lista de todos os agendamentos.
   */
  listarAgendamentos(): Observable<Agendamento[]> {
    return this.http.get<Agendamento[]>(this.apiUrl);
  }

  /**
   * Cria um novo agendamento.
   * @param agendamento Dados do agendamento a ser criado
   */
  criarAgendamento(agendamento: Agendamento): Observable<Agendamento> {
    return this.http.post<Agendamento>(this.apiUrl, agendamento);
  }

  /**
   * Atualiza um agendamento existente.
   * @param agendamento Agendamento com ID e dados atualizados
   */
  atualizarAgendamento(agendamento: Agendamento): Observable<void> {
    if (!agendamento.id) {
      throw new Error('ID do agendamento é obrigatório para atualização.');
    }
    const url = `${this.apiUrl}/${agendamento.id}`;
    return this.http.put<void>(url, agendamento);
  }

  /**
   * Cancela (exclui) um agendamento pelo ID.
   * @param id ID do agendamento a ser cancelado
   */
  cancelarAgendamento(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url);
  }
}
