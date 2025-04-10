import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface HistoricoAgendamento {
  id: number;
  nomeCliente: string;
  dataHora: string;
  motivoCancelamento: string;
  dataRegistro: string;
}

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './historico-agendamentos.component.html',
  styleUrls: ['./historico-agendamentos.component.css']
})
export class HistoricoComponent implements OnInit {
  historico: HistoricoAgendamento[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarHistorico();
  }

  carregarHistorico(): void {
    this.http.get<HistoricoAgendamento[]>('http://localhost:5273/api/agendamento/historico')
      .subscribe({
        next: (data) => {
          this.historico = data;
        },
        error: (err) => console.error('Erro ao buscar histórico:', err)
      });
  }
}
