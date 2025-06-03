import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgendamentosService } from '../../services/agendamentos.service';
import { Agendamento } from '../../models/agendamento.model';
import { MatTableModule, MatTableDataSource } from '@angular/material/table'; // <-- aqui está o MatTableDataSource
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ConfirmarExclusaoComponent } from '../../components/shared/confirmar-exclusao.component';
import { FormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { Output, EventEmitter } from '@angular/core';

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
    MatSortModule   
  ],
  templateUrl: './fila-espera.component.html',
  styleUrls: ['./fila-espera.component.scss']
})

export class FilaEsperaComponent implements OnInit {
  filaEspera: Agendamento[] = [];
  @Output() clientePromovido = new EventEmitter<void>();
  dataSource = new MatTableDataSource<Agendamento>([]);
  agendamentos: Agendamento[] = [];  // lista geral da agenda
  filtro: string = '';
  carregandoFila = false;
  paginaAtual = 0;
  tamanhoPagina = 5;
  private agendamentosMap: Map<number, Agendamento> = new Map();
  displayedColumns: string[] = ['nomeCliente', 'dataHora', 'servico', 'acoes'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private agendamentosService: AgendamentosService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
    
  ) {}

  ngOnInit(): void {
    this.carregarFilaEspera();
  }

 ngAfterViewInit(): void {
  setTimeout(() => {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  });
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

  promoverCliente(id: number): void {
  this.agendamentosService.promoverDaFilaParaAgenda(id).subscribe({
    next: (res) => {
      this.snackBar.open(res.message, 'Fechar', { duration: 3000 });
      this.carregarFilaEspera();
      this.carregarAgendamentos();
      this.clientePromovido.emit(); // <-- aqui!
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

carregarFilaEspera(): void {
  this.carregandoFila = true;
  this.agendamentosService.buscarFilaEspera().subscribe({
    next: (dados: Agendamento[]) => {
      this.filaEspera = dados;
      this.dataSource = new MatTableDataSource<Agendamento>(dados);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      // 🔁 Força atualização da visualização paginada:
      this.filaFiltrada;
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

    get filaFiltrada(): Agendamento[] {
    const termo = this.filtro.trim().toLowerCase();
    const filtrada = !termo
      ? this.filaEspera
      : this.filaEspera.filter(a =>
          a.nomeCliente.toLowerCase().includes(termo)
        );

    // Atualiza a fila paginada com base na página atual
    const inicio = this.paginaAtual * this.tamanhoPagina;
    const fim = inicio + this.tamanhoPagina;
    this.agendamentos = filtrada.slice(inicio, fim);

    return filtrada;
  }

  isAntigo(agendamento: Agendamento): boolean {
    const dias = 3;
    const dataAgendamento = new Date(agendamento.dataHora);
    const hoje = new Date();
    const diff = (hoje.getTime() - dataAgendamento.getTime()) / (1000 * 3600 * 24);
    return diff > dias;
  }

    aplicarFiltro(): void {
    this.dataSource.filter = this.filtro.trim().toLowerCase();
  }

  onPaginaAlterada(event: any): void {
  this.paginaAtual = event.pageIndex;
  this.tamanhoPagina = event.pageSize;
  this.filaFiltrada; // Força reavaliação e atualização de `filaPaginada`
}

}
