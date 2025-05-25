import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

// Serviços e componentes internos
import { AgendamentosService } from '../services/agendamentos.service';
import { AuthService } from '../services/auth.service';
import { DataService } from '../services/data.service';
import { Agendamento } from '../models/agendamento.model';
import { ConfirmarExclusaoComponent } from '../components/shared/confirmar-exclusao.component';
import { FilaEsperaComponent } from './fila-espera/fila-espera.component';
import { BlacklistComponent } from './blacklist/blacklist.component';

// Externo
import { Modal } from 'bootstrap';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-agenda-semanal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCardModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    FilaEsperaComponent,
    BlacklistComponent
  ],
  templateUrl: './agenda-semanal.component.html',
  styleUrls: ['./agenda-semanal.component.css']
})
export class AgendaSemanalComponent implements OnInit {
  // Formulário
  agendamentoForm: FormGroup;
    formAgendamento = {
    nomeCliente: '',
    telefone: '',
    servico: '',
    data: '',
    horario: '',
    confirmado: false
  };

  // Dados e estados
  dataAtual: Date = new Date();
  diasSemana: Date[] = [];
  colunasDias: string[] = [];
  displayedColumns: string[] = [];

  diaSelecionado!: Date;
  horarioSelecionado!: string;
  modalAgendamentoInstance: any;

  horariosDisponiveis: string[] = [
    '09:00', '10:00', '11:00',
    '13:00', '14:00', '15:00',
    '16:00', '17:00', '18:00', '19:00'
  ];

  agendamentos: Agendamento[] = [];
  agendamentosSemanaAtual: { [horario: string]: { [dia: string]: Agendamento | null } } = {};

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

  private agendamentosMap: Map<number, Agendamento> = new Map();

  constructor(
    private fb: FormBuilder,
    private agendamentosService: AgendamentosService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private dataService: DataService,
    private authService: AuthService,
    private router: Router
  ) {
    this.agendamentoForm = this.fb.group({
      nomeCliente: ['', Validators.required],
      telefone: [''],
      servico: [''],
      confirmado: [false],
      data: ['', Validators.required],
      horario: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.preencherAnos();
    this.atualizarSemanaDoMesEAnoSelecionado();
    this.carregarAgendamentos();

    const hoje = new Date();
    const semanaAtualIndex = this.semanasDoAno.findIndex(semana =>
      semana.some(dia => dia.toDateString() === hoje.toDateString())
    );

    const modalElement = document.getElementById('modalAgendamento');
    if (modalElement) {
      this.modalAgendamentoInstance = new Modal(modalElement);
    }

    if (semanaAtualIndex !== -1) {
      this.semanaIndex = semanaAtualIndex;
      this.mesAtual = hoje.getMonth();
      this.anoAtual = hoje.getFullYear();

      this.semanasDoMes = this.dataService.filtrarSemanasDoMes(this.semanasDoAno, this.anoAtual, this.mesAtual);
      this.indiceSemanaDoMes = this.semanasDoMes.findIndex(semana =>
        semana.some(dia => dia.toDateString() === hoje.toDateString())
      );

      this.atualizarSemana();
    }
  }

  get intervaloSemanaAtual(): string {
    if (!this.diasSemana || this.diasSemana.length < 7) return '';

    const [inicio, fim] = [this.diasSemana[0], this.diasSemana[6]];
    const formato: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
    return `${inicio.toLocaleDateString('pt-BR', formato)} até ${fim.toLocaleDateString('pt-BR', formato)}`;
  }

  preencherAnos(): void {
    const anoAtual = new Date().getFullYear();
    this.anos = Array.from({ length: 2 }, (_, i) => anoAtual + i);
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
  }

  semanaAnterior(): void {
    if (this.indiceSemanaDoMes > 0) {
      this.indiceSemanaDoMes--;
      const semanaAnterior = this.semanasDoMes[this.indiceSemanaDoMes];
      this.semanaIndex = this.semanasDoAno.findIndex(s =>
        s[0].toDateString() === semanaAnterior[0].toDateString()
      );
      this.atualizarSemana();
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
        this.atualizarAgendamentosSemana();
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

    formatarDataParaInput(data: Date): string {
      const ano = data.getFullYear();
      const mes = (data.getMonth() + 1).toString().padStart(2, '0');
      const dia = data.getDate().toString().padStart(2, '0');
      return `${ano}-${mes}-${dia}`;
    }
    
  abrirModalAgendamento(dia: Date, horario: string): void {
  this.diaSelecionado = dia;
  this.horarioSelecionado = horario;

  this.formAgendamento = {
    nomeCliente: '',
    telefone: '',
    servico: '',
    data: this.formatarDataParaInput(this.diaSelecionado),
    horario: horario,
    confirmado: false
  };

  const modalEl = document.getElementById('modalAgendamento');
  if (modalEl) {
    const modal = new Modal(modalEl);
    this.modalAgendamentoInstance = modal;
    modal.show();
  } else {
    console.error('Elemento modalAgendamento não encontrado no DOM.');
  }
}

  confirmarAgendamento() {
  const ag = this.formAgendamento;

  if (!ag.nomeCliente || !ag.data || !ag.horario) {
    alert('Por favor, preencha todos os campos obrigatórios.');
    return;
  }

  const novoAgendamento: Agendamento = {
    id: 0,
    nomeCliente: ag.nomeCliente,
    telefone: ag.telefone,
    servico: ag.servico,
    confirmado: ag.confirmado,
    dataHora: `${ag.data}T${ag.horario}:00`
  };

  this.agendamentosService.criarAgendamento(novoAgendamento).subscribe({
    next: () => {
      this.snackBar.open('Agendamento salvo com sucesso!', 'Fechar', { duration: 3000 });
      this.modalAgendamentoInstance?.hide();
      this.carregarAgendamentos();
    },
    error: () => {
      this.snackBar.open('Erro ao salvar agendamento.', 'Fechar', { duration: 3000 });
    }
  });
}

  irParaSemana(indice: number): void {
    if (indice >= 0 && indice < this.semanasDoMes.length) {
      this.indiceSemanaDoMes = indice;
      const novaSemana = this.semanasDoMes[indice];
      this.semanaIndex = this.semanasDoAno.findIndex(s =>
        s[0].toDateString() === novaSemana[0].toDateString()
      );
      this.atualizarSemana();
    }
  }

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

  private comporDataHora(dia: Date, horario: string): string {
    const [hora, minuto] = horario.split(':');
    const data = new Date(dia);
    data.setHours(+hora, +minuto, 0, 0);
    return data.toISOString();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
