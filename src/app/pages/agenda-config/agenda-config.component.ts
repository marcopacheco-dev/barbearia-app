import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { AgendaConfigService } from '../../services/agenda-config.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-agenda-config',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'agenda-config.component.html',
  styleUrls: ['agenda-config.component.css'] // opcional se tiver estilos
})

export class AgendaConfigComponent {
  private agendaConfigService = inject(AgendaConfigService);

  horariosDisponiveis: string[] = this.agendaConfigService.getHorariosDisponiveis();
  horariosSelecionados$: Observable<string[]> = this.agendaConfigService.getHorariosHabilitados$();
  diasSelecionados$: Observable<number[]> = this.agendaConfigService.getDiasHabilitados$();

  diasSemana = [
    { id: 0, nome: 'Domingo' },
    { id: 1, nome: 'Segunda' },
    { id: 2, nome: 'Terça' },
    { id: 3, nome: 'Quarta' },
    { id: 4, nome: 'Quinta' },
    { id: 5, nome: 'Sexta' },
    { id: 6, nome: 'Sábado' },
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  toggleHorario(horario: string, selecionados: string[]) {
    const atualizados = selecionados.includes(horario)
      ? selecionados.filter(h => h !== horario)
      : [...selecionados, horario];

    this.agendaConfigService.setHorariosHabilitados(atualizados);
  }

  toggleDia(dia: number, selecionados: number[]) {
    const atualizados = selecionados.includes(dia)
      ? selecionados.filter(d => d !== dia)
      : [...selecionados, dia];

    this.agendaConfigService.setDiasHabilitados(atualizados);
  }

  salvarConfiguracao() {
    const horarios = this.agendaConfigService.getHorariosHabilitadosSnapshot();
    const dias = this.agendaConfigService.getDiasHabilitadosSnapshot();

    // Aqui você pode integrar com o backend se quiser
    console.log('Horários salvos:', horarios);
    console.log('Dias salvos:', dias);

    alert('✅ Configuração salva com sucesso!');
  }

   logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
