import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgendamentosService } from '../services/agendamentos.service';
import { Agendamento } from '../models/agendamento.model';

@Component({
  selector: 'app-agenda-semanal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agenda-semanal.component.html',
  styleUrls: ['./agenda-semanal.component.css']
})
export class AgendaSemanalComponent implements OnInit {
  diasSemana: Date[] = [];
  horariosDisponiveis: string[] = [
    '09:00', '10:00', '11:00',
    '13:00', '14:00', '15:00',
    '16:00', '17:00', '18:00', '19:00'
  ];
  agendamentos: Agendamento[] = [];

  constructor(private agendamentosService: AgendamentosService) {}

  ngOnInit(): void {
    this.gerarSemana();
    this.carregarAgendamentos();
  }

  gerarSemana(): void {
    const hoje = new Date();
    const inicioSemana = hoje.getDate() - hoje.getDay() + 1; // segunda-feira
    // Gera os dias de terça (i=0) a domingo (i=5)
    this.diasSemana = Array.from({ length: 6 }, (_, i) => {
      const dia = new Date(hoje);
      dia.setDate(inicioSemana + i + 1); // +1 para começar na terça
      return dia;
    });
  }

  carregarAgendamentos(): void {
    this.agendamentosService.listarAgendamentos().subscribe({
      next: (dados) => this.agendamentos = dados,
      error: (erro) => console.error('Erro ao carregar agendamentos:', erro)
    });
  }

  temAgendamento(dia: Date, horario: string): boolean {
    const dataHora = new Date(this.comporDataHora(dia, horario)).getTime();
    return this.agendamentos.some(a => {
      const agendamentoData = new Date(a.dataHora).getTime();
      return agendamentoData === dataHora;
    });
  }

  getNomeCliente(dia: Date, horario: string): string {
    const dataHora = new Date(this.comporDataHora(dia, horario)).getTime();
    const agendamento = this.agendamentos.find(a => {
      const agendamentoData = new Date(a.dataHora).getTime();
      return agendamentoData === dataHora;
    });
    return agendamento?.nomeCliente || '';
  }

  private comporDataHora(dia: Date, horario: string): string {
    const [hora, minuto] = horario.split(':');
    const data = new Date(dia);
    data.setHours(+hora, +minuto, 0, 0);
    return data.toISOString();
  }
}
