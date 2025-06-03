import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Agendamento } from '../../models/agendamento.model';
import { AgendamentoDTO } from '../../models/AgendamentoDTO.model';
import { AgendamentosService } from '../../services/agendamentos.service';
import { ConfirmarExclusaoComponent } from '../../components/shared/confirmar-exclusao.component';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

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

  // Converte AgendamentoDTO para Agendamento (string -> Date)
  private dtoParaAgendamento(dto: AgendamentoDTO): Agendamento {
    return {
      ...dto,
      dataHora: new Date(dto.dataHora)
    };
  }

  // Converte Agendamento para AgendamentoDTO (Date -> string)
  private agendamentoParaDTO(ag: Agendamento): AgendamentoDTO {
    return {
      ...ag,
      dataHora: ag.dataHora.toISOString()
    };
  }

  carregarAgendamentos(): void {
    this.agendamentosService.listarAgendamentos().subscribe({
      next: (dadosDTO) => {
        this.agendamentos = dadosDTO.map(dto => this.dtoParaAgendamento(dto))
          .sort((a, b) => a.dataHora.getTime() - b.dataHora.getTime());
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

    // Cria Date local com data e hora do formulário
    const dataHoraLocal = new Date(`${data}T${horario}:00`);

    if (this.editando && this.agendamentoEditandoId !== undefined) {
      const agendamentoAtualizado: Agendamento = {
        id: this.agendamentoEditandoId,
        nomeCliente,
        telefone,
        servico,
        confirmado,
        dataHora: dataHoraLocal
      };
      const dto = this.agendamentoParaDTO(agendamentoAtualizado);
      this.agendamentosService.atualizarAgendamento(this.agendamentoEditandoId, dto).subscribe({
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
      const novoAgendamento: Agendamento = {
        nomeCliente,
        telefone,
        servico,
        confirmado,
        dataHora: dataHoraLocal
      };
      const dto = this.agendamentoParaDTO(novoAgendamento);
      this.agendamentosService.criarAgendamento(dto).subscribe({
        next: (agendamentoCriadoDTO) => {
          const agendamentoCriado = this.dtoParaAgendamento(agendamentoCriadoDTO);
          this.snackBar.open('Agendamento criado com sucesso!', 'Fechar', { duration: 3000 });
          this.agendamentos.push(agendamentoCriado);
          this.agendamentos.sort((a, b) => a.dataHora.getTime() - b.dataHora.getTime());
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

    // Converte a data UTC para horário local de Brasília
    const dataBrasilia = new Date(
      agendamento.dataHora.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })
    );

    // Formata data yyyy-MM-dd para input date
    const ano = dataBrasilia.getFullYear();
    const mes = (dataBrasilia.getMonth() + 1).toString().padStart(2, '0');
    const dia = dataBrasilia.getDate().toString().padStart(2, '0');
    const data = `${ano}-${mes}-${dia}`;

    // Formata hora HH:mm para input time
    const hora = dataBrasilia.getHours().toString().padStart(2, '0');
    const minuto = dataBrasilia.getMinutes().toString().padStart(2, '0');
    const horario = `${hora}:${minuto}`;

    this.agendamentoForm.patchValue({
      nomeCliente: agendamento.nomeCliente,
      telefone: agendamento.telefone,
      servico: agendamento.servico,
      confirmado: agendamento.confirmado,
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