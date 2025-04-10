import { Routes } from '@angular/router';
import { AgendaSemanalComponent } from './pages/agenda-semanal.component';
import { AgendamentosComponent } from './components/agendamentos/agendamentos.component'; // <-- importa o componente
import { HistoricoComponent } from './components/agendamentos/historico/historico-agendamentos.component';


export const routes: Routes = [
  {
    path: '',
    redirectTo: 'agenda-semanal',
    pathMatch: 'full'
  },
  {
    path: 'agenda-semanal',
    component: AgendaSemanalComponent
  },
  {
    path: 'agendamentos',
    component: AgendamentosComponent // <-- define a rota
  },
  {
    path: 'historico',
    component: HistoricoComponent
  }
];
