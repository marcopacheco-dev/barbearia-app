import { Component, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { AuthService } from './services/auth.service';
import { LoginComponent } from './login/login.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,      // Necessário para <router-outlet>
    MatTableModule,
    FormsModule,
    LoginComponent     // Só adicione aqui se realmente usa <app-login> no template
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  modoEscuroAtivo = false;

  constructor(
    private renderer: Renderer2,
    public authService: AuthService
  ) {
    const salvo = localStorage.getItem('modoEscuro');
    this.modoEscuroAtivo = salvo === 'true';
    this.ativarModoEscuro(this.modoEscuroAtivo);
  }

  alternarTema(): void {
    this.modoEscuroAtivo = !this.modoEscuroAtivo;
    this.ativarModoEscuro(this.modoEscuroAtivo);
  }

  ativarModoEscuro(ativar: boolean): void {
    const html = document.documentElement;
    if (ativar) {
      this.renderer.addClass(html, 'dark-mode');
      localStorage.setItem('modoEscuro', 'true');
    } else {
      this.renderer.removeClass(html, 'dark-mode');
      localStorage.setItem('modoEscuro', 'false');
    }
  }

  logout(): void {
    this.authService.logout();
  }
}