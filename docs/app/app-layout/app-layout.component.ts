import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';  // Importando CommonModule
import { RouterModule } from '@angular/router';  // Importando RouterModule
import { AuthService } from '../services/auth.service';  // Seu serviço de autenticação

@Component({
  selector: 'app-layout',
  standalone: true,  // Definindo o componente como standalone
  imports: [CommonModule, RouterModule],  // Importando os módulos necessários
  templateUrl: './app-layout.component.html'
})
export class AppLayoutComponent implements OnInit{

  // public isHeaderVisible: boolean = true; // Controle de visibilidade do cabeçalho

  constructor(public authService: AuthService) {}
  // instanceId = Math.random().toString(36).substring(2, 9); // ID único para cada instância

    ngOnInit() {
    //   console.log('AppLayout renderizado, ID:', this.instanceId);
    //   // Lógica para determinar se o cabeçalho deve ser removido
    //   if (this.isHeaderVisible) {
    //     // Remover o cabeçalho duplicado ou evitar a renderização
    //     this.isHeaderVisible = false; // Defina como false para ocultar o cabeçalho
    // }
  }
}