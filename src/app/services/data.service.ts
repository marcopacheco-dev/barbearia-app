import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  gerarSemanasDoAno(ano: number): Date[][] {
    const semanas: Date[][] = [];
    let data = new Date(ano, 0, 1);

    while (data.getFullYear() === ano) {
      const semana: Date[] = [];
      const diaSemana = data.getDay();
      const inicioSemana = new Date(data);
      inicioSemana.setDate(data.getDate() - diaSemana);

      for (let i = 0; i < 7; i++) {
        const dia = new Date(inicioSemana);
        dia.setDate(inicioSemana.getDate() + i);
        semana.push(dia);
      }

      semanas.push(semana);
      data.setDate(data.getDate() + 7);
    }

    return semanas;
  }

  filtrarSemanasDoMes(semanas: Date[][], ano: number, mes: number): Date[][] {
    return semanas.filter(semana =>
      semana.some(dia => dia.getFullYear() === ano && dia.getMonth() === mes)
    );
  }

  formatarIntervaloSemana(dias: Date[]): string {
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
    const inicio = formatter.format(dias[0]);
    const fim = formatter.format(dias[dias.length - 1]);
    return `${inicio} até ${fim}`;
  }

  comporDataHora(dia: Date, horario: string): string {
    const [hora, minuto] = horario.split(':');
    const data = new Date(dia);
    data.setHours(+hora, +minuto, 0, 0);
    return data.toISOString();
  }

  encontrarIndiceSemana(semana: Date[], semanasDoAno: Date[][]): number {
    return semanasDoAno.findIndex(s =>
      s[0].toDateString() === semana[0].toDateString()
    );
  }
}
