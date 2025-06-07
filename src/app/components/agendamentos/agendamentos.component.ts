import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Agendamento } from '../../models/agendamento.model';
import { AgendamentosService } from '../../services/agendamentos.service';
import { ConfirmarExclusaoComponent } from '../../components/shared/confirmar-exclusao.component';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-agendamentos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxMaskDirective,
    MatDialogModule,
    MatSnackBarModule
  ],
  providers: [provideNgxMask()],
  templateUrl: './agendamentos.component.html',
  styleUrls: ['./agendamentos.component.css']
})
export class AgendamentosComponent implements OnInit {
  agendamentoForm: FormGroup;
  agendamentos: Agendamento[] = [];
  editando = false;
  agendamentoEditandoId?: number;

  constructor(
    private fb: FormBuilder,
    private agendamentosService: AgendamentosService,
    private snackBar: MatSnackBar, 
    private dialog: MatDialog,
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
    this.carregarAgendamentos();
  }

  // Função para interpretar string ISO como horário local (sem ajuste de fuso)
  private parseDateAsLocal(dateString: string): Date {
    const [datePart, timePart] = dateString.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute, second] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute, second);
  }

  carregarAgendamentos(): void {
    this.agendamentosService.listarAgendamentos().subscribe({
      next: (dados) => {
        this.agendamentos = dados.map(ag => ({
          ...ag,
          dataHoraLocal: this.parseDateAsLocal(ag.dataHora)
        })).sort((a, b) =>
          a.dataHoraLocal.getTime() - b.dataHoraLocal.getTime()
        );
      },
      error: (erro) => console.error('Erro ao carregar agendamentos:', erro)
    });
  }

  enviarAgendamento(): void {
    if (this.agendamentoForm.invalid) {
      console.warn('Formulário inválido');
      return;
    }

    const { nomeCliente, telefone, servico, confirmado, data, horario } = this.agendamentoForm.value;

    // Cria um objeto Date local com data e hora do formulário
    const dataHoraLocal = new Date(`${data}T${horario}:00`);

    // Formata a data/hora no formato ISO local (sem converter para UTC)
    const dataHoraLocalString = dataHoraLocal.getFullYear() + '-' +
      (dataHoraLocal.getMonth() + 1).toString().padStart(2, '0') + '-' +
      dataHoraLocal.getDate().toString().padStart(2, '0') + 'T' +
      dataHoraLocal.getHours().toString().padStart(2, '0') + ':' +
      dataHoraLocal.getMinutes().toString().padStart(2, '0') + ':00';

    if (this.editando && this.agendamentoEditandoId !== undefined) {
      const agendamento: Agendamento = {
        id: this.agendamentoEditandoId,
        nomeCliente,
        telefone,
        servico,
        confirmado,
        dataHora: dataHoraLocalString
      };
      this.agendamentosService.atualizarAgendamento(this.agendamentoEditandoId, agendamento).subscribe({
        next: () => {
          this.snackBar.open('Agendamento atualizado com sucesso!', 'Fechar', { duration: 3000 });
          this.carregarAgendamentos();
          this.cancelarEdicao();
        },
        error: (erro) => {
          console.error('Erro ao atualizar agendamento:', erro);
          this.snackBar.open('Erro ao atualizar agendamento.', 'Fechar', { duration: 3000 });
        }
      });
    } else {
      const agendamentoDTO = {
        nomeCliente,
        telefone,
        servico,
        confirmado,
        dataHora: dataHoraLocalString
      };
      this.agendamentosService.criarAgendamento(agendamentoDTO).subscribe({
        next: (agendamentoCriado) => {
          this.snackBar.open('Agendamento criado com sucesso!', 'Fechar', { duration: 3000 });
          this.agendamentos.push(agendamentoCriado);
          this.agendamentos.sort((a, b) =>
            this.parseDateAsLocal(a.dataHora).getTime() - this.parseDateAsLocal(b.dataHora).getTime()
          );
          this.agendamentoForm.reset();
        },
        error: (erro) => {
          console.error('Erro ao criar agendamento:', erro);
          this.snackBar.open('Erro ao criar agendamento.', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

 editarAgendamento(agendamento: Agendamento): void {
  this.editando = true;
  this.agendamentoEditandoId = agendamento.id;

  // Converte a data ISO da API (UTC) para America/Sao_Paulo
  const dataAjustada = DateTime.fromISO(agendamento.dataHora, { zone: 'utc' }).setZone('America/Sao_Paulo');

  // Formata para os padrões aceitos pelos inputs date e time
  const data = dataAjustada.toFormat('yyyy-MM-dd');
  const horario = dataAjustada.toFormat('HH:mm');

  this.agendamentoForm.patchValue({
    nomeCliente: agendamento.nomeCliente || '',
    telefone: agendamento.telefone || '',
    servico: agendamento.servico || '',
    confirmado: agendamento.confirmado ?? false,
    data,
    horario
  });
}

  cancelarEdicao(): void {
    this.editando = false;
    this.agendamentoEditandoId = undefined;
    this.agendamentoForm.reset();
  }

  cancelarAgendamento(id: number, nomeCliente: string): void {
    const dialogRef = this.dialog.open(ConfirmarExclusaoComponent, {
      width: '300px',
      data: { nome: nomeCliente }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.agendamentosService.cancelarAgendamento(id).subscribe(() => {
          this.carregarAgendamentos();
          this.snackBar.open('Agendamento cancelado com sucesso!', 'Fechar', {
            duration: 3000,
            panelClass: ['snackbar-success']
          });
        });
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}