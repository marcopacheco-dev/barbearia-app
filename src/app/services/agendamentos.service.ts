import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Agendamento } from '../models/agendamento.model';

@Injectable({
  providedIn: 'root'
})
export class AgendamentosService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5273/api/agendamento';

  // Lista todos os agendamentos do backend
  listarAgendamentos(): Observable<Agendamento[]> {
    return this.http.get<Agendamento[]>(this.apiUrl);
  }

  // Cria um novo agendamento
  criarAgendamento(agendamento: Agendamento): Observable<Agendamento> {
    return this.http.post<Agendamento>(this.apiUrl, agendamento);
  }

  // Atualiza um agendamento existente
  atualizarAgendamento(agendamento: Agendamento): Observable<void> {
    if (!agendamento.id) {
      throw new Error('ID do agendamento é obrigatório para atualização.');
    }
    return this.http.put<void>(`${this.apiUrl}/${agendamento.id}`, agendamento);
  }

  // Exclui um agendamento por ID
  excluirAgendamento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
