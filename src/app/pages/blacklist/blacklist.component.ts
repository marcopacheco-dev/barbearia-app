import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';

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
    FormsModule
  ],
  templateUrl: './blacklist.component.html',
  styleUrls: ['./blacklist.component.scss']
})
export class BlacklistComponent implements OnInit {
  blacklist: ClienteBlacklist[] = [];
  dataSource = new MatTableDataSource<ClienteBlacklist>([]);
  carregandoBlacklist = false;
  filtro = '';
  displayedColumns: string[] = ['nome', 'telefone', 'motivo', 'dataCadastro', 'acoes'];
  baseUrl = 'http://localhost:5273/api'; // Incluído /api para corresponder ao backend

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarBlacklist();

    // Configura o filtro para buscar em nome, telefone e motivo
    this.dataSource.filterPredicate = (data: ClienteBlacklist, filter: string) => {
      const termo = filter.trim().toLowerCase();
      return data.nome.toLowerCase().includes(termo) ||
             data.telefone.toLowerCase().includes(termo) ||
             data.motivo.toLowerCase().includes(termo);
    };
  }

  /** Carrega a lista de clientes bloqueados */
  carregarBlacklist(): void {
    this.carregandoBlacklist = true;
    this.http.get<ClienteBlacklist[]>(`${this.baseUrl}/Agendamento/blacklist`).subscribe({
      next: (data) => {
        this.blacklist = data;
        this.dataSource.data = data; // Atualiza o dataSource da tabela
      },
      error: (err) => {
        console.error("Erro ao carregar blacklist:", err);
        alert("Erro ao carregar blacklist.");
      },
      complete: () => {
        this.carregandoBlacklist = false;
      }
    });
  }

  /** Remove um cliente da blacklist */
  removerDaBlacklist(id: number): void {
    if (confirm("Deseja remover este cliente da blacklist?")) {
      this.http.delete(`${this.baseUrl}/Agendamento/blacklist/${id}`).subscribe({
        next: () => {
          this.blacklist = this.blacklist.filter(c => c.id !== id);
          this.dataSource.data = this.blacklist; // Atualiza o dataSource após remoção
          alert("Cliente removido da blacklist com sucesso.");
        },
        error: (err) => {
          console.error("Erro ao remover cliente:", err);
          alert("Erro ao remover cliente da blacklist.");
        }
      });
    }
  }

  /** Aplica filtro por nome, telefone ou motivo */
  aplicarFiltro(): void {
    this.dataSource.filter = this.filtro.trim().toLowerCase();
  }
}
