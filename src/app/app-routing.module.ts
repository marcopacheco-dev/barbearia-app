import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard'; // Guarda de autenticação
import { AgendaSemanalComponent } from './pages/agenda-semanal.component'; // Agenda Semanal
import { AgendamentosComponent } from './components/agendamentos/agendamentos.component'; // Agendamentos
import { HistoricoComponent } from './components/agendamentos/historico/historico-agendamentos.component'; // Histórico de Agendamentos
import { LoginComponent } from './pages/login/login.component'; // Página de login
import { AppLayoutComponent } from './app-layout/app-layout.component'; // Layout com navegação

const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent, // Layout com navegação
    // canActivate: [AuthGuard], // Protege as rotas com AuthGuard
    children: [
      { path: '', redirectTo: 'agenda-semanal', pathMatch: 'full' }, // Redireciona raiz para agenda
      { path: 'agenda-semanal', component: AgendaSemanalComponent },
      { path: 'agendamentos', component: AgendamentosComponent },
      { path: 'historico-agendamentos', component: HistoricoComponent },
    ],
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })], // ATENÇÃO: useHash: true para GitHub Pages
  exports: [RouterModule],
})
export class AppRoutingModule {}