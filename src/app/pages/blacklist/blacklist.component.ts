import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ViewChild, AfterViewInit } from '@angular/core';
import { MatSort } from '@angular/material/sort';


interface ClienteBlacklist {
  id: number;
  nome: string;
  telefone: string;
  motivo: string;
  dataCadastro: string;
}

@Component({
  selector: 'app-blacklist',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    MatPaginatorModule 
  ],
  templateUrl: './blacklist.component.html',
  styleUrls: ['./blacklist.component.scss']
})
export class BlacklistComponent implements OnInit, AfterViewInit {
  blacklist: ClienteBlacklist[] = [];
  dataSource = new MatTableDataSource<ClienteBlacklist>([]);
  carregandoBlacklist = false;
  filtro = '';
  displayedColumns: string[] = ['nome', 'telefone', 'motivo', 'dataCadastro', 'acoes'];
  baseUrl = 'http://localhost:5273/api';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarBlacklist();

    this.dataSource.filterPredicate = (data: ClienteBlacklist, filter: string) => {
      const termo = filter.trim().toLowerCase();
      return data.nome.toLowerCase().includes(termo) ||
             data.telefone.toLowerCase().includes(termo) ||
             data.motivo.toLowerCase().includes(termo);
    };
  }

    ngAfterViewInit(): void {
    setTimeout(() => {
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    });
  }


  carregarBlacklist(): void {
    this.carregandoBlacklist = true;
    this.http.get<ClienteBlacklist[]>(`${this.baseUrl}/Agendamento/blacklist`).subscribe({
      next: (data) => {
        this.blacklist = data;
        this.dataSource.data = data;

        // Em caso de chamada após view init
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }
      },
      error: (err) => {
        console.error("Erro ao carregar blacklist:", err);
      },
      complete: () => {
        this.carregandoBlacklist = false;
      }
    });
  }

  removerDaBlacklist(id: number): void {
    if (confirm("Deseja remover este cliente da blacklist?")) {
      this.http.delete(`${this.baseUrl}/Agendamento/blacklist/${id}`).subscribe({
        next: () => {
          this.blacklist = this.blacklist.filter(c => c.id !== id);
          this.dataSource.data = this.blacklist;
          alert("Cliente removido da blacklist com sucesso.");
        },
        error: (err) => {
          console.error("Erro ao remover cliente:", err);
          alert("Erro ao remover cliente da blacklist.");
        }
      });
    }
  }

  aplicarFiltro(): void {
    this.dataSource.filter = this.filtro.trim().toLowerCase();
  }
}
