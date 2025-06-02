import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirmar-exclusao',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Confirmar Cancelamento</h2>
  <mat-dialog-content>
    Tem certeza que deseja cancelar o agendamento de <strong>{{ data.nome }}</strong>?
  </mat-dialog-content>
  <mat-dialog-actions align="end">
    <button mat-button mat-dialog-close="false">Não</button>
    <button mat-button color="warn" [mat-dialog-close]="true" cdkFocusInitial>Sim</button>
  </mat-dialog-actions>
  `
})
export class ConfirmarExclusaoComponent {
    constructor(
      @Inject(MAT_DIALOG_DATA) public data: { nome: string },
      public dialogRef: MatDialogRef<ConfirmarExclusaoComponent>
    ) {}
  }

  