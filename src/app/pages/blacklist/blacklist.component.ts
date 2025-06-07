import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import * as bootstrap from 'bootstrap';

import { BlacklistEntry } from '../../models/blacklist.model'; // ajuste o caminho conforme seu projeto

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
  blacklist: BlacklistEntry[] = [];
  dataSource = new MatTableDataSource<BlacklistEntry>([]);
  carregandoBlacklist = false;
  filtro = '';
  displayedColumns: string[] = ['nome', 'telefone', 'motivo', 'dataCadastro', 'acoes'];
  baseUrl = 'https://barbeariaapi-production.up.railway.app';

  novoCliente: Partial<BlacklistEntry> = { nome: '', telefone: '', motivo: '', ativo: true };

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarBlacklist();

    this.dataSource.filterPredicate = (data: BlacklistEntry, filter: string) => {
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
    this.http.get<BlacklistEntry[]>(`${this.baseUrl}/Agendamento/blacklist`).subscribe({
      next: (data) => {
        // Filtra apenas clientes ativos
        this.blacklist = data.filter(c => c.ativo);
        this.dataSource.data = this.blacklist;

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

  abrirModalAdicionarCliente(): void {
    this.novoCliente = { nome: '', telefone: '', motivo: '', ativo: true };
    const modal = new bootstrap.Modal(document.getElementById('modalAdicionarCliente')!);
    modal.show();
  }

  adicionarClienteNaBlacklist(): void {
    if (!this.novoCliente.nome?.trim() || !this.novoCliente.telefone?.trim()) {
      alert('Nome e telefone são obrigatórios.');
      return;
    }

    this.carregandoBlacklist = true;
    this.http.post(`${this.baseUrl}/Agendamento/blacklist`, this.novoCliente).subscribe({
      next: () => {
        alert('Cliente adicionado à blacklist com sucesso.');
        this.carregarBlacklist();
        this.carregandoBlacklist = false;
        const modalEl = document.getElementById('modalAdicionarCliente');
        const modal = bootstrap.Modal.getInstance(modalEl!);
        modal?.hide();
      },
      error: (err) => {
        console.error('Erro ao adicionar cliente à blacklist:', err);
        alert('Erro ao adicionar cliente à blacklist.');
        this.carregandoBlacklist = false;
      }
    });
  }
}