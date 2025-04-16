import { Component, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, MatTableModule, FormsModule ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'] // certifique-se de que este arquivo exista
})
export class AppComponent {
  modoEscuroAtivo = false;

  constructor(private renderer: Renderer2) {
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
}
