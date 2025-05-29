import { Component, OnInit } from '@angular/core';
import { AgendaConfigService } from '../../services/agenda-config.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';  // importe o serviço correto
import { Router } from '@angular/router';                 // importe o Router

interface DiaSemana {
  id: number;
  nome: string;
}

@Component({
  selector: 'app-agenda-config',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agenda-config.component.html',
  styleUrls: ['./agenda-config.component.css'],
})
export class AgendaConfigComponent implements OnInit {
  horariosDisponiveis: string[] = [];
  horariosSelecionados: string[] = [];

  diasSemana: DiaSemana[] = [
    { id: 0, nome: 'Domingo' },
    { id: 1, nome: 'Segunda-feira' },
    { id: 2, nome: 'Terça-feira' },
    { id: 3, nome: 'Quarta-feira' },
    { id: 4, nome: 'Quinta-feira' },
    { id: 5, nome: 'Sexta-feira' },
    { id: 6, nome: 'Sábado' },
  ];

  diasSelecionados: number[] = [];

  constructor(
    private agendaConfigService: AgendaConfigService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.horariosDisponiveis = this.gerarHorariosDisponiveis();

    this.agendaConfigService.carregarConfiguracaoDoServidor();

    this.agendaConfigService.getHorariosHabilitados$().subscribe((horarios) => {
      this.horariosSelecionados = horarios;
    });

    this.agendaConfigService.getDiasHabilitados$().subscribe((dias) => {
      this.diasSelecionados = dias;
    });
  }

  private gerarHorariosDisponiveis(): string[] {
    const horarios: string[] = [];
    for (let i = 0; i < 24; i++) {
      const hora = i.toString().padStart(2, '0') + ':00';
      horarios.push(hora);
    }
    return horarios;
  }

  toggleHorario(horario: string) {
    if (this.horariosSelecionados.includes(horario)) {
      this.horariosSelecionados = this.horariosSelecionados.filter((h) => h !== horario);
    } else {
      this.horariosSelecionados.push(horario);
    }
    this.agendaConfigService.setHorariosHabilitados(this.horariosSelecionados);
  }

  toggleDia(diaId: number) {
    if (this.diasSelecionados.includes(diaId)) {
      this.diasSelecionados = this.diasSelecionados.filter((d) => d !== diaId);
    } else {
      this.diasSelecionados.push(diaId);
    }
    this.agendaConfigService.setDiasHabilitados(this.diasSelecionados);
  }

  salvarConfiguracao() {
    this.agendaConfigService.salvarConfiguracaoNoServidor().subscribe({
      next: () => alert('✅ Configuração salva com sucesso!'),
      error: (err) => {
        console.error('Erro ao salvar configuração:', err);
        alert('❌ Erro ao salvar configuração.');
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
