import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Agendamento } from '../models/agendamento.model';

@Injectable({
  providedIn: 'root'
})
export class AgendamentosService {
  private http = inject(HttpClient); // 👈 Aqui está a diferença!
  private readonly apiUrl = 'http://localhost:5273/api/agendamento';

  listarAgendamentos(): Observable<Agendamento[]> {
    return this.http.get<Agendamento[]>(this.apiUrl);
  }

  criarAgendamento(agendamento: Agendamento): Observable<Agendamento> {
    return this.http.post<Agendamento>(this.apiUrl, agendamento);
  }

  atualizarAgendamento(agendamento: Agendamento): Observable<void> {
    if (!agendamento.id) {
      throw new Error('ID do agendamento é obrigatório para atualização.');
    }
    return this.http.put<void>(`${this.apiUrl}/${agendamento.id}`, agendamento);
  }

  excluirAgendamento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
