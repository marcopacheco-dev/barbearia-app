import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import moment from 'moment';

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
import { AgendaConfigService } from '../services/agenda-config.service';
import { DataService } from '../services/data.service';
import { Agendamento } from '../models/agendamento.model';
import { ConfirmarExclusaoComponent } from '../components/shared/confirmar-exclusao.component';
import { FilaEsperaComponent } from './fila-espera/fila-espera.component';
import { BlacklistComponent } from './blacklist/blacklist.component';

// Externo
import { Modal } from 'bootstrap';
import * as bootstrap from 'bootstrap';
import { combineLatest } from 'rxjs';

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
  agendamentoForm: FormGroup;
  formAgendamento = {
    nomeCliente: '',
    telefone: '',
    servico: '',
    data: '',
    horario: '',
    confirmado: false
  };

  dataAtual: Date = new Date();
  diasSemana: Date[] = [];
  colunasDias: string[] = [];
  displayedColumns: string[] = [];
  clienteEmEdicao: Agendamento | null = null;
  diaSelecionado!: Date;
  horarioSelecionado!: string;
  modalAgendamentoInstance: any;
  agendamentosConfirmados: Agendamento[] = [];
  agendamentosNaoConfirmados: Agendamento[] = [];

  horariosDisponiveis: string[] = [];
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
  diasHabilitados: number[] = [];
  horariosHabilitados: string[] = [];
  usuarioLogado: boolean = false;
  semanaIndex: number = 0;
  semanasDoAno: Date[][] = [];
  semanasDoMes: Date[][] = [];
  indiceSemanaDoMes: number = 0;

  private agendamentosMap: Map<number, Agendamento> = new Map();

  constructor(
    private fb: FormBuilder,
    private agendamentosService: AgendamentosService,
    private agendaConfigService: AgendaConfigService,
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
    this.usuarioLogado = this.authService.isAuthenticated();

    this.agendaConfigService.carregarConfiguracaoDoServidor();

    combineLatest([
      this.agendaConfigService.getDiasHabilitados$(),
      this.agendaConfigService.getHorariosHabilitados$()
    ]).subscribe(([dias, horarios]) => {
      this.diasHabilitados = dias || [];
      this.horariosHabilitados = horarios || [];
      this.horariosDisponiveis = [...this.horariosHabilitados];
      this.atualizarSemanaDoMesEAnoSelecionado();
    });

    this.carregarAgendamentos();
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
    const semanaCompleta = this.semanasDoAno[this.semanaIndex] || [];
    this.diasSemana = semanaCompleta.filter(dia => this.diasHabilitados.includes(dia.getDay()));
    this.colunasDias = this.diasSemana.map((_, i) => `dia${i}`);
    this.horariosDisponiveis = [...this.horariosHabilitados];
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

  private parseDateAsLocal(dateString: string): Date {
    // Converte string ISO UTC para Date local
    return new Date(dateString);
  }

  carregarAgendamentos(): void {
    this.agendamentosService.listarAgendamentos().subscribe({
      next: (dados) => {
        this.agendamentos = dados.map(a => ({
          ...a,
          dataHoraLocal: this.parseDateAsLocal(a.dataHora)
        }));

        this.agendamentosConfirmados = this.agendamentos.filter(a => a.confirmado === true);
        this.agendamentosNaoConfirmados = this.agendamentos.filter(a => a.confirmado === false);

        this.agendamentosMap = new Map(this.agendamentos.map(a => [a.dataHoraLocal!.getTime(), a]));

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

  abrirModalAgendamento(dia: Date, horarioUtc: string): void {
    this.diaSelecionado = dia;

    // Converte a string UTC para Date
    const dataUtc = new Date(horarioUtc);

    // Extrai a hora e minuto no horário local do navegador
    const horaLocal = dataUtc.getHours().toString().padStart(2, '0');
    const minutoLocal = dataUtc.getMinutes().toString().padStart(2, '0');
    const horarioLocal = `${horaLocal}:${minutoLocal}`;

    this.formAgendamento = {
      nomeCliente: '',
      telefone: '',
      servico: '',
      data: this.formatarDataParaInput(this.diaSelecionado),
      horario: horarioLocal,
      confirmado: false
    };
    this.clienteEmEdicao = null;

    const modalEl = document.getElementById('modalAgendamento');
    if (modalEl) {
      if (!this.modalAgendamentoInstance) {
        this.modalAgendamentoInstance = new Modal(modalEl);
      }
      this.modalAgendamentoInstance.show();
    } else {
      console.error('Elemento do modal de agendamento não encontrado.');
    }
  }

  editarAgendamento(agendamento: Agendamento): void {
    this.clienteEmEdicao = agendamento;

    // Interpreta a data do backend como UTC e converte para local
    const dataUTC = moment.utc(agendamento.dataHora).local();

    this.formAgendamento = {
      nomeCliente: agendamento.nomeCliente || '',
      telefone: agendamento.telefone || '',
      servico: agendamento.servico || '',
      data: dataUTC.format('YYYY-MM-DD'),
      horario: dataUTC.format('HH:mm'),
      confirmado: agendamento.confirmado ?? false
    };

    const modalEl = document.getElementById('modalAgendamento');
    if (modalEl) {
      if (!this.modalAgendamentoInstance) {
        this.modalAgendamentoInstance = new Modal(modalEl);
      }
      this.modalAgendamentoInstance.show();
    } else {
      console.error('Elemento do modal de agendamento não encontrado.');
    }
  }

  private formatarDataHoraLocalISO(data: Date): string {
    const ano = data.getFullYear();
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    const dia = data.getDate().toString().padStart(2, '0');
    const hora = data.getHours().toString().padStart(2, '0');
    const minuto = data.getMinutes().toString().padStart(2, '0');
    const segundo = data.getSeconds().toString().padStart(2, '0');
    return `${ano}-${mes}-${dia}T${hora}:${minuto}:${segundo}`;
  }

  confirmarAgendamento(): void {
    const ag = this.formAgendamento;

    if (!ag.nomeCliente || !ag.data || !ag.horario) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Quebra a data em ano, mês e dia
    const [ano, mes, dia] = ag.data.split('-').map(Number);

    // Quebra a hora e minuto do input
    const [hora, minuto] = ag.horario.split(':').map(Number);

    // Cria um objeto Date local com os componentes
    const dataLocal = new Date(ano, mes - 1, dia, hora, minuto, 0);
    console.log('Data local:', dataLocal.toString());

    // Converte para UTC
    const dataUTC = new Date(dataLocal.getTime() - dataLocal.getTimezoneOffset() * 60000);
    console.log('Data convertida para UTC:', dataUTC.toISOString());

    const novoAgendamento: Agendamento = {
      nomeCliente: ag.nomeCliente,
      telefone: ag.telefone,
      servico: ag.servico,
      confirmado: ag.confirmado,
      dataHora: dataUTC.toISOString() // ISO com 'Z' indicando UTC
    };

    console.log('Enviando para API:', novoAgendamento);

    if (this.clienteEmEdicao) {
      novoAgendamento.id = this.clienteEmEdicao.id;

      this.agendamentosService.atualizarAgendamento(novoAgendamento.id!, novoAgendamento).subscribe({
        next: () => {
          this.snackBar.open('Agendamento atualizado com sucesso!', 'Fechar', { duration: 3000 });
          this.modalAgendamentoInstance?.hide();
          this.carregarAgendamentos();
          this.clienteEmEdicao = null;
          this.resetarFormAgendamento();
        },
        error: (err) => {
          console.error('Erro ao atualizar agendamento:', err);
          this.snackBar.open('Erro ao atualizar agendamento. Tente novamente.', 'Fechar', { duration: 3000 });
        }
      });
    } else {
      this.agendamentosService.criarAgendamento(novoAgendamento).subscribe({
        next: () => {
          this.snackBar.open('Agendamento salvo com sucesso!', 'Fechar', { duration: 3000 });
          this.modalAgendamentoInstance?.hide();
          this.carregarAgendamentos();
          this.resetarFormAgendamento();
        },
        error: (err) => {
          console.error('Erro ao salvar agendamento:', err);
          this.snackBar.open('Erro ao salvar agendamento. Tente novamente.', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  resetarFormAgendamento() {
    this.formAgendamento = {
      nomeCliente: '',
      telefone: '',
      servico: '',
      data: '',
      horario: '',
      confirmado: false
    };
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

  get intervaloSemanaAtual(): string {
    if (!this.diasSemana || this.diasSemana.length === 0) return '';
    const inicio = this.diasSemana[0];
    const fim = this.diasSemana[this.diasSemana.length - 1];
    const formato: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
    return `${inicio.toLocaleDateString('pt-BR', formato)} até ${fim.toLocaleDateString('pt-BR', formato)}`;
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

  formatarDataInput(dataHora: string) {
    return dataHora ? dataHora.substring(0, 10) : '';
  }
  formatarHoraInput(dataHora: string) {
    return dataHora ? dataHora.substring(11, 16) : '';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}