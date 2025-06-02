export interface AgendaConfiguracao {
  id?: number;
  diaSemana: number; // 0 = Domingo, 6 = Sábado
  horariosDisponiveis: string[]; // Ex: ['08:00', '09:30', ...]
}