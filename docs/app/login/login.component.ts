  import { Component } from '@angular/core';
  import { AuthService } from '../services/auth.service';
  import { Router, ActivatedRoute } from '@angular/router';
  import { CommonModule } from '@angular/common'; 
  import { FormsModule } from '@angular/forms'; 

  @Component({
    selector: 'app-login',
    standalone: true,
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    imports: [CommonModule, FormsModule]
  })
  export class LoginComponent {

      username: string = '';
      password: string = '';
      errorMessage: string = '';
      isLoading: boolean = false; // Indicador de carregamento
    
      constructor(
        private authService: AuthService, 
        private router: Router,
        private route: ActivatedRoute
      ) {}
    
      login(): void {
        this.isLoading = true;  // Ativa o indicador de carregamento
        this.authService.login({ username: this.username, password: this.password }).subscribe({
          next: () => {
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
            this.router.navigate([returnUrl]);
            this.isLoading = false; // Desativa o indicador de carregamento
          },
          error: (err) => {
            console.error('Erro no login', err);
            this.errorMessage = 'Credenciais inválidas. Tente novamente.';
            this.isLoading = false; // Desativa o indicador de carregamento
          }
        });
      }
      logout() {
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      }
    }