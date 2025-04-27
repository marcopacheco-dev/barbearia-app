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

  carregarAgendamentos(): void {
    this.agendamentosService.listarAgendamentos().subscribe({
      next: (dados) => {
        this.agendamentos = dados.sort((a, b) =>
          new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime()
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
    const dataHora = `${data}T${horario}:00`;

    const agendamento: Agendamento = {
      id: this.agendamentoEditandoId,
      nomeCliente,
      telefone,
      servico,
      confirmado,
      dataHora
    };

    if (this.editando && agendamento.id !== undefined) {
      this.agendamentosService.atualizarAgendamento(agendamento).subscribe({
        next: () => {
          console.log('Agendamento atualizado');
          this.carregarAgendamentos();
          this.cancelarEdicao();
        },
        error: (erro) => {
          console.error('Erro ao atualizar agendamento:', erro);
        }
      });
    } else {
      this.agendamentosService.criarAgendamento(agendamento).subscribe({
        next: (agendamentoCriado) => {
          console.log('Agendamento criado:', agendamentoCriado);
          this.agendamentos.push(agendamentoCriado);
          this.agendamentos.sort((a, b) =>
            new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime()
          );
          this.agendamentoForm.reset();
        },
        error: (erro) => {
          console.error('Erro ao criar agendamento:', erro);
        }
      });
    }
  }

  editarAgendamento(agendamento: Agendamento): void {
    this.editando = true;
    this.agendamentoEditandoId = agendamento.id;

    const [data, horarioCompleto] = agendamento.dataHora.split('T');
    const horario = horarioCompleto?.slice(0, 5);

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
