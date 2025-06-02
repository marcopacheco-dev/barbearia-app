import { Routes, provideRouter, withHashLocation } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { AgendamentosComponent } from './components/agendamentos/agendamentos.component';
import { HistoricoComponent } from './components/agendamentos/historico/historico-agendamentos.component';
import { AppLayoutComponent  } from './app-layout/app-layout.component';
import { AgendaConfigComponent } from './pages/agenda-config/agenda-config.component';

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'agenda-semanal',
        pathMatch: 'full',
      },
      {
        path: 'agenda-semanal',
        loadComponent: () => import('./pages/agenda-semanal.component').then(m => m.AgendaSemanalComponent),
      },
      { 
        path: 'agendamentos', 
        component: AgendamentosComponent,
        canActivate: [AuthGuard],
      },
      { 
        path: 'historico-agendamentos', 
        component: HistoricoComponent,
        canActivate: [AuthGuard],
      },
      { 
        path: 'agenda-config', 
        component: AgendaConfigComponent,
        canActivate: [AuthGuard],
      },
    ],
  },
  { path: 'login', component: LoginComponent },
];

// Exporte o provider já com hash location
export const appRouterProvider = provideRouter(routes, withHashLocation());