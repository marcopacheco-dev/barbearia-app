import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AgendaConfigService {
  private readonly LOCAL_STORAGE_HORARIOS = 'agenda_horarios_habilitados';
  private readonly LOCAL_STORAGE_DIAS = 'agenda_dias_habilitados';

  private horariosDisponiveis = [
    '01:00','02:00','03:00', '04:00', '05:00',
    '06:00','07:00','08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00','16:00', '17:00', 
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00'
  ];

  private horariosHabilitadosSubject = new BehaviorSubject<string[]>(this.getHorariosSalvos());
  private diasHabilitadosSubject = new BehaviorSubject<number[]>(this.getDiasSalvos());

  constructor() {}

  getHorariosDisponiveis() {
    return this.horariosDisponiveis;
  }

  getHorariosHabilitados$() {
    return this.horariosHabilitadosSubject.asObservable();
  }

  getDiasHabilitados$() {
    return this.diasHabilitadosSubject.asObservable();
  }

  setHorariosHabilitados(horarios: string[]) {
    this.horariosHabilitadosSubject.next(horarios);
    localStorage.setItem(this.LOCAL_STORAGE_HORARIOS, JSON.stringify(horarios));
  }

  setDiasHabilitados(dias: number[]) {
    this.diasHabilitadosSubject.next(dias);
    localStorage.setItem(this.LOCAL_STORAGE_DIAS, JSON.stringify(dias));
  }

  getHorariosHabilitadosSnapshot(): string[] {
    return this.horariosHabilitadosSubject.getValue();
  }

  getDiasHabilitadosSnapshot(): number[] {
    return this.diasHabilitadosSubject.getValue();
  }

  private getHorariosSalvos(): string[] {
    const data = localStorage.getItem(this.LOCAL_STORAGE_HORARIOS);
    return data ? JSON.parse(data) : [
      '09:00', '10:00', '11:00',
      '13:00', '14:00', '15:00',
      '16:00', '17:00', '18:00', '19:00'
    ];
  }

  private getDiasSalvos(): number[] {
    const data = localStorage.getItem(this.LOCAL_STORAGE_DIAS);
    return data ? JSON.parse(data) : [0, 1, 2, 3, 4, 5, 6];
  }
}
