import { Component } from '@angular/core';
import { provideRouter, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule // Importa o outlet para renderizar as rotas
  ],
  template: `<router-outlet></router-outlet>`
})
export class AppComponent {}
