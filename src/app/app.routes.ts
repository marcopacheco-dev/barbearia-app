import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { AgendamentosComponent } from './components/agendamentos/agendamentos.component';
import { HistoricoComponent } from './components/agendamentos/historico/historico-agendamentos.component';
import { AppLayoutComponent  } from './app-layout/app-layout.component';
import { AgendaConfigComponent } from './pages/agenda-config/agenda-config.component';

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent, // Componente principal (com menu, header, etc)
    canActivate: [AuthGuard], // Protege a rota principal com AuthGuard
    children: [
      {
        path: '',
        redirectTo: 'agenda-semanal', // Redireciona para a agenda-semanal
        pathMatch: 'full',
      },
      {
        path: 'agenda-semanal',
        loadComponent: () => import('./pages/agenda-semanal.component').then(m => m.AgendaSemanalComponent),
      },
      { 
        path: 'agendamentos', 
        component: AgendamentosComponent,
        canActivate: [AuthGuard], // Protege a rota de agendamentos
      },
      { 
        path: 'historico-agendamentos', 
        component: HistoricoComponent,
        canActivate: [AuthGuard], // Protege a rota de histórico de agendamentos
      },
      { 
        path: 'agenda-config', 
        component: AgendaConfigComponent,
        canActivate: [AuthGuard], // Protege a rota de histórico de agendamentos
      },
    ],
  },
  { path: 'login', component: LoginComponent }, // Página de login
];
