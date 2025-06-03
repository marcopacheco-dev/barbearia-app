import { Component, OnInit, AfterViewInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgendamentosService } from '../../services/agendamentos.service';
import { Agendamento } from '../../models/agendamento.model';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ConfirmarExclusaoComponent } from '../../components/shared/confirmar-exclusao.component';
import { FormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';

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
    FormsModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule
  ],
  templateUrl: './fila-espera.component.html',
  styleUrls: ['./fila-espera.component.scss']
})
export class FilaEsperaComponent implements OnInit, AfterViewInit {
  filaEspera: Agendamento[] = [];
  dataSource = new MatTableDataSource<Agendamento>([]);
  filtro: string = '';
  carregandoFila = false;
  displayedColumns: string[] = ['nomeCliente', 'dataHora', 'servico', 'acoes'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @Output() clientePromovido = new EventEmitter<void>();

  constructor(
    private agendamentosService: AgendamentosService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.carregarFilaEspera();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  carregarFilaEspera(): void {
    this.carregandoFila = true;
    this.agendamentosService.buscarFilaEspera().subscribe({
      next: (dados) => {
        this.filaEspera = dados.map(a => ({
          ...a,
          dataHora: new Date(a.dataHora)
        }));
        this.dataSource.data = this.filaEspera;
      },
      error: (erro) => {
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
          error: (erro) => {
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

  aplicarFiltro(): void {
    this.dataSource.filter = this.filtro.trim().toLowerCase();
  }

  promoverCliente(id: number): void {
    this.agendamentosService.promoverDaFilaParaAgenda(id).subscribe({
      next: (res) => {
        this.snackBar.open(res.message, 'Fechar', { duration: 3000 });
        this.carregarFilaEspera();
        this.clientePromovido.emit();
      },
      error: (err) => {
        this.snackBar.open(
          err?.error?.message || 'Erro ao promover o cliente.',
          'Fechar',
          { duration: 3000 }
        );
      }
    });
  }

  isAntigo(agendamento: Agendamento): boolean {
    const dias = 3;
    const dataAgendamento = new Date(agendamento.dataHora);
    const hoje = new Date();
    const diff = (hoje.getTime() - dataAgendamento.getTime()) / (1000 * 3600 * 24);
    return diff > dias;
  }
}