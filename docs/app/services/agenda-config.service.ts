import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AgendaConfigService {
  private readonly apiUrl = `${environment.apiUrl}/agendamento/config`; // Ajustado para o endpoint correto

  private horariosHabilitadosSubject = new BehaviorSubject<string[]>([]);
  private diasHabilitadosSubject = new BehaviorSubject<number[]>([]);
  semanasDoAno: Date[][] = [];
  semanaIndex: number = 0;

  constructor(private http: HttpClient) {
    this.carregarConfiguracaoDoServidor(); // carrega config ao iniciar o serviço
  }

  getHorariosHabilitados$(): Observable<string[]> {
    return this.horariosHabilitadosSubject.asObservable();
  }

  getDiasHabilitados$(): Observable<number[]> {
    return this.diasHabilitadosSubject.asObservable();
  }

  getDatasHabilitadas$(): Observable<Date[]> {
  // Se semanasDoAno não for Observable, transformamos em Observable com 'of'
  return combineLatest([
    this.getDiasHabilitados$(),
    of(this.semanasDoAno)
  ]).pipe(
    map(([diasHabilitados, semanas]) => {
      if (!semanas || semanas.length === 0) return [];

      const semanaAtual = semanas[this.semanaIndex];
      if (!semanaAtual) return [];

      // filtra os dias da semana atual que estão habilitados
      const datasFiltradas = semanaAtual.filter(dia => diasHabilitados.includes(dia.getDay()));

      return datasFiltradas;
    })
  );
}

  setHorariosHabilitados(horarios: string[]): void {
    this.horariosHabilitadosSubject.next(horarios);
  }

  setDiasHabilitados(dias: number[]): void {
    this.diasHabilitadosSubject.next(dias);
  }

  getHorariosHabilitadosSnapshot(): string[] {
    return this.horariosHabilitadosSubject.getValue();
  }

  getDiasHabilitadosSnapshot(): number[] {
    return this.diasHabilitadosSubject.getValue();
  }

  carregarConfiguracaoDoServidor(): void {
    this.http.get<{ horarios: string[], dias: number[] }>(this.apiUrl)
      .subscribe({
        next: config => {
          this.horariosHabilitadosSubject.next(config.horarios);
          this.diasHabilitadosSubject.next(config.dias);
        },
        error: err => {
          console.error('Erro ao carregar configuração da agenda', err);
        }
      });
  }

  carregarConfiguracao(): Observable<{ diasHabilitados: number[], horariosHabilitados: string[] }> {
  return this.http.get<{ diasHabilitados: number[], horariosHabilitados: string[] }>(this.apiUrl);
}

  salvarConfiguracaoNoServidor(): Observable<any> {
    const configuracao = {
      dias: this.diasHabilitadosSubject.value,
      horarios: this.horariosHabilitadosSubject.value
    };

    console.log('Enviando para backend:', configuracao);

    return this.http.post(this.apiUrl, configuracao);
  }
}

