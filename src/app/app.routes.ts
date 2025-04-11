import { Routes } from '@angular/router';
import { AgendamentosComponent } from './components/agendamentos/agendamentos.component';
import { HistoricoComponent } from './components/agendamentos/historico/historico-agendamentos.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'agenda-semanal',
    pathMatch: 'full'
  },
  {
    path: 'agenda-semanal',
    loadComponent: () => import('./pages/agenda-semanal.component').then(m => m.AgendaSemanalComponent)
  },
  {
    path: 'agendamentos',
    component: AgendamentosComponent
  },
  {
    path: 'historico',
    component: HistoricoComponent
  }
];