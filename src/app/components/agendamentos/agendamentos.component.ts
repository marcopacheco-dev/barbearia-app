import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Agendamento } from '../../models/agendamento.model';
import { AgendamentosService } from '../../services/agendamentos.service';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

@Component({
  selector: 'app-agendamentos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxMaskDirective
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
    private agendamentosService: AgendamentosService
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

  excluirAgendamento(id: number): void {
    this.agendamentosService.excluirAgendamento(id).subscribe({
      next: () => {
        this.agendamentos = this.agendamentos
          .filter(a => a.id !== id)
          .sort((a, b) =>
            new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime()
          );
        console.log('Agendamento excluído');
      },
      error: (erro) => console.error('Erro ao excluir agendamento:', erro)
    });
  }
}
