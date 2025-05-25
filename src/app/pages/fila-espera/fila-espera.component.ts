import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgendamentosService } from '../../services/agendamentos.service';
import { Agendamento } from '../../models/agendamento.model';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ConfirmarExclusaoComponent } from '../../components/shared/confirmar-exclusao.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-fila-espera',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    FormsModule
  ],
  templateUrl: './fila-espera.component.html',
  styleUrls: ['./fila-espera.component.scss']
})
export class FilaEsperaComponent implements OnInit {
  filaEspera: Agendamento[] = [];
  filtro: string = '';
  carregandoFila = false;

  displayedColumns: string[] = ['nomeCliente', 'dataHora', 'servico', 'acoes'];

  constructor(
    private agendamentosService: AgendamentosService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.carregarFilaEspera();
  }

  carregarFilaEspera(): void {
    this.carregandoFila = true;

    this.agendamentosService.buscarFilaEspera().subscribe({
      next: (dados: Agendamento[]) => {
        this.filaEspera = dados;
      },
      error: (erro: any) => {
        console.error('Erro ao carregar fila de espera:', erro);
        this.snackBar.open('Erro ao carregar fila de espera', 'Fechar', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
      },
      complete: () => {
        this.carregandoFila = false;
      }
    });
  }

  removerDaFila(agendamento: Agendamento): void {
    const dialogRef = this.dialog.open(ConfirmarExclusaoComponent, {
      width: '300px',
      data: { nome: agendamento.nomeCliente }
    });

    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (confirmado && agendamento.id) {
        this.agendamentosService.removerDaFila(agendamento.id).subscribe({
          next: () => {
            this.snackBar.open('Removido da fila com sucesso!', 'Fechar', {
              duration: 3000,
              panelClass: ['snackbar-success']
            });
            this.carregarFilaEspera();
          },
          error: (erro: any) => {
            console.error('Erro ao remover agendamento:', erro);
            this.snackBar.open('Erro ao remover da fila', 'Fechar', {
              duration: 3000,
              panelClass: ['snackbar-error']
            });
          }
        });
      }
    });
  }

  // Filtro por nome
  get filaFiltrada(): Agendamento[] {
    if (!this.filtro) return this.filaEspera;
    return this.filaEspera.filter(a =>
      a.nomeCliente.toLowerCase().includes(this.filtro.toLowerCase())
    );
  }

  // Destacar agendamentos antigos
  isAntigo(agendamento: Agendamento): boolean {
    const dias = 3;
    const dataAgendamento = new Date(agendamento.dataHora);
    const hoje = new Date();
    const diff = (hoje.getTime() - dataAgendamento.getTime()) / (1000 * 3600 * 24);
    return diff > dias;
  }
}
