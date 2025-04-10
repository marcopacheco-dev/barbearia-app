import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgendamentosService } from '../services/agendamentos.service';
import { Agendamento } from '../models/agendamento.model';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmarExclusaoComponent } from '../components/shared/confirmar-exclusao.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-agenda-semanal',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './agenda-semanal.component.html',
  styleUrls: ['./agenda-semanal.component.css']
})
export class AgendaSemanalComponent implements OnInit {
  diasSemana: Date[] = [];
  colunasDias: string[] = [];
  displayedColumns: string[] = [];

  horariosDisponiveis: string[] = [
    '09:00', '10:00', '11:00',
    '13:00', '14:00', '15:00',
    '16:00', '17:00', '18:00', '19:00'
  ];
  agendamentos: Agendamento[] = [];

  constructor(
    private agendamentosService: AgendamentosService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.gerarSemana();
    this.colunasDias = this.diasSemana.map((_, i) => `dia${i}`);
    this.displayedColumns = ['horario', ...this.colunasDias];
    this.carregarAgendamentos();
  }

  gerarSemana(): void {
    const hoje = new Date();
    const inicioSemana = hoje.getDate() - hoje.getDay() + 1;
    this.diasSemana = Array.from({ length: 6 }, (_, i) => {
      const dia = new Date(hoje);
      dia.setDate(inicioSemana + i + 1);
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

  cancelarAgendamento(dia: Date, horario: string): void {
    const dataHora = new Date(this.comporDataHora(dia, horario)).getTime();
    const agendamento = this.agendamentos.find(a => {
      const agendamentoData = new Date(a.dataHora).getTime();
      return agendamentoData === dataHora;
    });

    if (agendamento?.id) {
      const dialogRef = this.dialog.open(ConfirmarExclusaoComponent, {
        width: '300px',
        data: {
          nome: agendamento.nomeCliente
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result === true && agendamento?.id) {
          this.agendamentosService.cancelarAgendamento(agendamento.id!).subscribe(() => {
            this.carregarAgendamentos();

            this.snackBar.open('Agendamento cancelado com sucesso!', 'Fechar', {
              duration: 3000,
              panelClass: ['snackbar-success']
            });
          });
        }
      });
    }
  }

  private comporDataHora(dia: Date, horario: string): string {
    const [hora, minuto] = horario.split(':');
    const data = new Date(dia);
    data.setHours(+hora, +minuto, 0, 0);
    return data.toISOString();
  }
}
