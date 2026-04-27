import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-permiso-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data?.permiso ? 'Editar Permiso' : 'Nuevo Permiso' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="permisoForm" class="permiso-form">
        <mat-form-field appearance="outline">
          <mat-label>CÓDIGO *</mat-label>
          <input matInput formControlName="codigo" placeholder="ej: usuarios.view">
          <mat-error *ngIf="permisoForm.get('codigo')?.hasError('required')">El código es obligatorio</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>NOMBRE DEL PERMISO *</mat-label>
          <input matInput formControlName="nombre" placeholder="Nombre descriptivo">
          <mat-error *ngIf="permisoForm.get('nombre')?.hasError('required')">El nombre es obligatorio</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>DESCRIPCIÓN</mat-label>
          <textarea matInput formControlName="descripcion" rows="4" placeholder="Descripción detallada del permiso..."></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="start" class="dialog-actions">
      <button mat-flat-button color="primary" class="btn-guardar" [disabled]="permisoForm.invalid" (click)="onSubmit()">Guardar</button>
      <button mat-flat-button class="btn-cancelar" (click)="onCancel()">Cancelar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .permiso-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-top: 10px;
      min-width: 400px;
    }
    mat-form-field {
      width: 100%;
    }
    .dialog-actions {
      padding: 16px 24px;
      display: flex;
      gap: 12px;
      justify-content: flex-start;
    }
    .btn-guardar {
      background-color: #111827 !important;
      color: white !important;
      border-radius: 8px;
      padding: 8px 32px;
      flex: 1;
    }
    .btn-cancelar {
      background-color: #e5e7eb !important;
      color: #374151 !important;
      border-radius: 8px;
      padding: 8px 32px;
      flex: 1;
    }
    ::ng-deep .mat-mdc-dialog-title {
      font-weight: bold;
      font-size: 24px;
      color: #000;
    }
    ::ng-deep .mat-mdc-form-field-label {
      font-weight: 500;
      color: #4b5563;
    }
  `]
})
export class PermisoFormComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<PermisoFormComponent>);
  public data = inject(MAT_DIALOG_DATA);

  permisoForm: FormGroup = this.fb.group({
    codigo: [this.data?.permiso?.codigo || '', [Validators.required]],
    nombre: [this.data?.permiso?.nombre || '', [Validators.required]],
    descripcion: [this.data?.permiso?.descripcion || '']
  });

  onCancel() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.permisoForm.valid) {
      this.dialogRef.close(this.permisoForm.value);
    }
  }
}
