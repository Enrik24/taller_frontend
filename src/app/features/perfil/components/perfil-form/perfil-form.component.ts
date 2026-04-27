import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../../core/services/api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-perfil-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <form [formGroup]="perfilForm" (ngSubmit)="guardar()" class="perfil-form">
      <div class="form-row">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" type="email">
          <mat-icon matPrefix>email</mat-icon>
        </mat-form-field>
      </div>

      <div class="form-row">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre Completo</mat-label>
          <input matInput formControlName="nombre" placeholder="Ej. Juan Pérez">
          <mat-icon matPrefix>person</mat-icon>
          <mat-error *ngIf="perfilForm.get('nombre')?.hasError('required')">
            El nombre es obligatorio
          </mat-error>
        </mat-form-field>
      </div>

      <div class="form-row">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Teléfono</mat-label>
          <input matInput formControlName="telefono" placeholder="Ej. +591 71234567">
          <mat-icon matPrefix>phone</mat-icon>
        </mat-form-field>
      </div>

      <div class="form-row">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Dirección</mat-label>
          <input matInput formControlName="direccion" placeholder="Ej. Av. Principal #123">
          <mat-icon matPrefix>location_on</mat-icon>
        </mat-form-field>
      </div>

      <!-- Campos extra para Taller o Admin -->
      <ng-container *ngIf="tipoUsuario === 'taller' || tipoUsuario === 'administrador'">
        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nombre Comercial (Taller)</mat-label>
            <input matInput formControlName="nombre_comercial" placeholder="Ej. Taller Central">
            <mat-icon matPrefix>store</mat-icon>
          </mat-form-field>
        </div>

        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>Latitud</mat-label>
            <input matInput formControlName="latitud" type="number" step="any">
            <mat-icon matPrefix>explore</mat-icon>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Longitud</mat-label>
            <input matInput formControlName="longitud" type="number" step="any">
            <mat-icon matPrefix>explore</mat-icon>
          </mat-form-field>
        </div>
      </ng-container>
      
      <div *ngIf="errorMessage" class="error-msg">
        {{ errorMessage }}
      </div>

      <div class="actions">
        <button mat-flat-button color="primary" type="submit" [disabled]="perfilForm.invalid || isSubmitting">
          <mat-spinner *ngIf="isSubmitting" diameter="20" class="spinner"></mat-spinner>
          <mat-icon *ngIf="!isSubmitting">save</mat-icon>
          {{ isSubmitting ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
      </div>
    </form>
  `,
  styles: `
    .perfil-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px 0;
    }
    .form-row, .form-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .full-width {
      width: 100%;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 16px;
    }
    .spinner {
      margin-right: 8px;
      display: inline-block;
    }
    .error-msg {
      color: #d32f2f;
      font-size: 14px;
      margin-top: -8px;
    }
  `
})
export class PerfilFormComponent implements OnInit {
  @Input() set usuario(val: any) {
    this._usuario = val;
    if (this.perfilForm && val) {
      this.populateForm();
    }
  }
  @Input() tipoUsuario: 'cliente' | 'taller' | 'administrador' = 'cliente';
  @Output() guardado = new EventEmitter<any>();

  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);

  private _usuario: any = null;
  perfilForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  ngOnInit() {
    this.perfilForm = this.fb.group({
      email: [{ value: '', disabled: true }],
      nombre: ['', Validators.required],
      telefono: [''],
      direccion: [''],
      nombre_comercial: [''],
      latitud: [null],
      longitud: [null]
    });

    if (this._usuario) {
      this.populateForm();
    }
  }

  private populateForm() {
    this.perfilForm.patchValue({
      email: this._usuario?.email || '',
      nombre: this._usuario?.nombre || '',
      telefono: this._usuario?.telefono || '',
      direccion: this._usuario?.direccion_default || this._usuario?.direccion || '',
      nombre_comercial: this._usuario?.nombre_comercial || '',
      latitud: this._usuario?.latitud || null,
      longitud: this._usuario?.longitud || null
    });
  }

  async guardar() {
    if (this.perfilForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    const payload = this.perfilForm.getRawValue();
    delete payload.email;

    // Envolvemos en 'data' para consistencia con los requisitos del backend
    const body = {
      ...payload,
      data: payload
    };

    try {
      const resp = await firstValueFrom(this.apiService.put<any>('perfil', body));
      this.guardado.emit(resp);
      // El alert se movió aquí para asegurar que solo se muestre en éxito real
      alert('Perfil guardado exitosamente');
    } catch (error: any) {
      console.warn('Error saving profile', error);
      this.errorMessage = 'No se pudo guardar el perfil. Intenta de nuevo.';
      // Fallback para desarrollo/pruebas
      this.guardado.emit({ ...this._usuario, ...payload });
    } finally {
      this.isSubmitting = false;
    }
  }
}
