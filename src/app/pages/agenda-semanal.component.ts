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
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DataService } from '../services/data.service';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-agenda-semanal',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    FormsModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCardModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  // changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './agenda-semanal.component.html',
  styleUrls: ['./agenda-semanal.component.css']
})
export class AgendaSemanalComponent implements OnInit {
  dataAtual: Date = new Date();
  diasSemana: Date[] = [];
  colunasDias: string[] = [];
  displayedColumns: string[] = [];

  horariosDisponiveis: string[] = [
    '09:00', '10:00', '11:00',
    '13:00', '14:00', '15:00',
    '16:00', '17:00', '18:00', '19:00'
  ];
  agendamentos: Agendamento[] = [];

  meses: string[] = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  mesSelecionado: string = this.meses[new Date().getMonth()];
  mesAtual: number = new Date().getMonth();
  anoAtual: number = new Date().getFullYear();
  anos: number[] = [];

  semanaIndex: number = 0;
  semanasDoAno: Date[][] = [];
  semanasDoMes: Date[][] = [];
  indiceSemanaDoMes: number = 0;

  modoEscuroAtivo = false;
  private agendamentosMap: Map<number, Agendamento> = new Map();

  constructor(
    private agendamentosService: AgendamentosService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private dataService: DataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.preencherAnos();
    this.atualizarSemanaDoMesEAnoSelecionado();
    // this.cdr.markForCheck();
  }

  get intervaloSemanaAtual(): string {
    if (!this.diasSemana || this.diasSemana.length < 7) return '';

    const inicio = this.diasSemana[0];
    const fim = this.diasSemana[6];

    const formato: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    };

    return `${inicio.toLocaleDateString('pt-BR', formato)} até ${fim.toLocaleDateString('pt-BR', formato)}`;
  }

  preencherAnos(): void {
    const anoAtual = new Date().getFullYear();
    this.anos = Array.from({ length: 5 }, (_, i) => anoAtual - 2 + i);
  }

  atualizarSemanaDoMesEAnoSelecionado(): void {
    this.semanasDoAno = this.dataService.gerarSemanasDoAno(this.anoAtual);
    this.semanasDoMes = this.dataService.filtrarSemanasDoMes(this.semanasDoAno, this.anoAtual, this.mesAtual);

    if (this.semanasDoMes.length > 0) {
      const primeiraSemana = this.semanasDoMes[0];
      this.semanaIndex = this.semanasDoAno.findIndex(s =>
        s[0].toDateString() === primeiraSemana[0].toDateString()
      );
      this.indiceSemanaDoMes = 0;
    } else {
      this.semanaIndex = 0;
      this.indiceSemanaDoMes = 0;
    }

    this.atualizarSemana();
  }

  atualizarSemana(): void {
    this.diasSemana = this.semanasDoAno[this.semanaIndex] || [];
    this.colunasDias = this.diasSemana.map((_, i) => `dia${i}`);
    this.displayedColumns = ['horario', ...this.colunasDias];

    this.carregarAgendamentos();
    this.atualizarAgendamentosSemana();
  }

  semanaAnterior(): void {
    if (this.indiceSemanaDoMes > 0) {
      this.indiceSemanaDoMes--;
      const semanaAnterior = this.semanasDoMes[this.indiceSemanaDoMes];
      this.semanaIndex = this.semanasDoAno.findIndex(s =>
        s[0].toDateString() === semanaAnterior[0].toDateString()
      );
      this.atualizarSemana();
      this.atualizarAgendamentosSemana();
    }
  }

  proximaSemana(): void {
    if (this.indiceSemanaDoMes < this.semanasDoMes.length - 1) {
      this.indiceSemanaDoMes++;
      const proximaSemana = this.semanasDoMes[this.indiceSemanaDoMes];
      this.semanaIndex = this.semanasDoAno.findIndex(s =>
        s[0].toDateString() === proximaSemana[0].toDateString()
      );
      this.atualizarSemana();
    }
  }

  selecionarMes(indiceMes: number): void {
    this.mesAtual = indiceMes;
    this.mesSelecionado = this.meses[indiceMes];
    this.atualizarSemanaDoMesEAnoSelecionado();
  }

  selecionarAno(ano: number): void {
    this.anoAtual = ano;
    this.atualizarSemanaDoMesEAnoSelecionado();
  }

  carregarAgendamentos(): void {
    this.agendamentosService.listarAgendamentos().subscribe({
      next: (dados) => {
        this.agendamentos = dados;
        this.agendamentosMap = new Map(dados.map(a => [new Date(a.dataHora).getTime(), a]));
      },
      error: (erro) => console.error('Erro ao carregar agendamentos:', erro)
    });
  }

  temAgendamento(dia: Date, horario: string): boolean {
    const dataHora = new Date(this.comporDataHora(dia, horario)).getTime();
    return this.agendamentosMap.has(dataHora);
  }

  getNomeCliente(dia: Date, horario: string): string {
    const dataHora = new Date(this.comporDataHora(dia, horario)).getTime();
    const agendamento = this.agendamentos.find(a => new Date(a.dataHora).getTime() === dataHora);
    return agendamento?.nomeCliente || '';
  }

  cancelarAgendamento(dia: Date, horario: string): void {
    const dataHora = new Date(this.comporDataHora(dia, horario)).getTime();
    const agendamento = this.agendamentos.find(a => new Date(a.dataHora).getTime() === dataHora);

    if (agendamento?.id) {
      const dialogRef = this.dialog.open(ConfirmarExclusaoComponent, {
        width: '300px',
        data: { nome: agendamento.nomeCliente }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result === true) {
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

  alternarTema(): void {
    this.modoEscuroAtivo = !this.modoEscuroAtivo;
    const root = document.documentElement;
    root.classList.toggle('dark-mode', this.modoEscuroAtivo);
  }

  private comporDataHora(dia: Date, horario: string): string {
    const [hora, minuto] = horario.split(':');
    const data = new Date(dia);
    data.setHours(+hora, +minuto, 0, 0);
    return data.toISOString();
  }

  irParaSemana(indice: number): void {
    if (indice >= 0 && indice < this.semanasDoMes.length) {
      this.indiceSemanaDoMes = indice;
      const novaSemana = this.semanasDoMes[indice];
      this.semanaIndex = this.semanasDoAno.findIndex(s =>
        s[0].toDateString() === novaSemana[0].toDateString()
      );
      this.atualizarSemana();
      console.log('Dias da nova semana:', this.diasSemana); // 👈
    }
  }

    agendamentosSemanaAtual: { [horario: string]: { [dia: string]: Agendamento | null } } = {};

    private atualizarAgendamentosSemana(): void {
      const resultado: { [horario: string]: { [dia: string]: Agendamento | null } } = {};

      for (const horario of this.horariosDisponiveis) {
        resultado[horario] = {};

        for (const dia of this.diasSemana) {
          const dataHora = new Date(this.comporDataHora(dia, horario)).getTime();
          const agendamento = this.agendamentos.find(a =>
            new Date(a.dataHora).getTime() === dataHora
          );
          resultado[horario][dia.toDateString()] = agendamento || null;
        }
      }

      this.agendamentosSemanaAtual = resultado;
    }
}