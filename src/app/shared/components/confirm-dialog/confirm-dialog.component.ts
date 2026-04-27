import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { 
  MatDialogModule, 
  MatDialogRef, 
  MAT_DIALOG_DATA 
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  showInput?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title class="dialog-title">{{ data.title }}</h2>
    <mat-dialog-content class="dialog-content">
      <p>{{ data.message }}</p>
      @if (data.showInput) {
        <mat-form-field appearance="outline" class="w-100" style="width: 100%; margin-top: 1rem;">
          <mat-label>Motivo</mat-label>
          <textarea matInput [(ngModel)]="motivo" rows="3" placeholder="Escriba aquí..."></textarea>
        </mat-form-field>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-button (click)="onCancel()" class="cancel-button">
        {{ data.cancelText || 'Cancelar' }}
      </button>
      <button mat-button color="warn" (click)="onConfirm()" class="confirm-button" [disabled]="data.showInput && !motivo().trim()">
        {{ data.confirmText || 'Confirmar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title {
      margin-bottom: 8px;
    }

    .dialog-content {
      min-width: 300px;
      padding-bottom: 16px;
    }

    .dialog-actions {
      padding-bottom: 8px;
    }
  `]
})
export class ConfirmDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  
  motivo = signal('');

  onConfirm(): void {
    if (this.data.showInput) {
      this.dialogRef.close(this.motivo());
    } else {
      this.dialogRef.close(true);
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
