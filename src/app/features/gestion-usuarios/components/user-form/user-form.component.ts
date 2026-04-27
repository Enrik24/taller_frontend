import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { Rol, Usuario } from '../../../../core/models';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ data.user ? 'edit' : 'person_add' }}</mat-icon>
      {{ data.user ? 'Editar Usuario' : 'Nuevo Usuario' }}
    </h2>
    <mat-dialog-content>
      <form [formGroup]="userForm" class="user-form">
        <mat-form-field appearance="outline">
          <mat-label>Nombre Completo</mat-label>
          <input matInput formControlName="nombre" placeholder="Ej: Juan Pérez">
          <mat-error *ngIf="userForm.get('nombre')?.hasError('required')">El nombre es obligatorio</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Correo Electrónico</mat-label>
          <input matInput formControlName="email" type="email" placeholder="ejemplo@correo.com">
          <mat-error *ngIf="userForm.get('email')?.hasError('required')">El email es obligatorio</mat-error>
          <mat-error *ngIf="userForm.get('email')?.hasError('email')">Email no válido</mat-error>
        </mat-form-field>

        <div class="password-group">
          <mat-form-field appearance="outline">
            <mat-label>{{ data.user ? 'Nueva Contraseña (Opcional)' : 'Contraseña' }}</mat-label>
            <input matInput formControlName="password" type="password" placeholder="Mínimo 6 caracteres" autocomplete="new-password">
            <mat-error *ngIf="userForm.get('password')?.hasError('required')">La contraseña es obligatoria</mat-error>
            <mat-error *ngIf="userForm.get('password')?.hasError('minlength')">Mínimo 6 caracteres</mat-error>
          </mat-form-field>
 
          <mat-form-field appearance="outline">
            <mat-label>Confirmar Contraseña</mat-label>
            <input matInput formControlName="confirmPassword" type="password" placeholder="Repita la contraseña" autocomplete="new-password">
            <mat-error *ngIf="userForm.get('confirmPassword')?.hasError('required')">Debe confirmar la contraseña</mat-error>
            <mat-error *ngIf="userForm.hasError('mismatch') && userForm.get('confirmPassword')?.touched">Las contraseñas no coinciden</mat-error>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Roles</mat-label>
          <mat-select formControlName="rol_ids" multiple>
            <mat-option *ngFor="let r of data.roles" [value]="r.id">
              {{ r.nombre }}
            </mat-option>
          </mat-select>
          <mat-error *ngIf="userForm.get('rol_ids')?.hasError('required')">Debe seleccionar al menos un rol</mat-error>
        </mat-form-field>

        <div class="tipo-group">
          <mat-form-field appearance="outline">
            <mat-label>Tipo de Usuario</mat-label>
            <mat-select formControlName="tipo">
              <mat-option value="administrador">Administrador</mat-option>
              <mat-option value="cliente">Cliente</mat-option>
              <mat-option value="taller">Taller</mat-option>
              <mat-option value="otros">Otros...</mat-option>
            </mat-select>
            <mat-error *ngIf="userForm.get('tipo')?.hasError('required')">El tipo es obligatorio</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" *ngIf="userForm.get('tipo')?.value === 'otros'">
            <mat-label>Especificar Tipo</mat-label>
            <input matInput formControlName="tipo_otro" placeholder="Ej: auditor, soporte, etc.">
            <mat-error *ngIf="userForm.get('tipo_otro')?.hasError('required')">Debe especificar el tipo</mat-error>
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="userForm.invalid" (click)="onSubmit()">
        {{ data.user ? 'Actualizar' : 'Crear Usuario' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .user-form {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding-top: 10px;
      min-width: 450px;
    }
    .password-group, .tipo-group {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    mat-form-field {
      width: 100%;
    }
    h2 {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class UserFormComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<UserFormComponent>);
  data = inject(MAT_DIALOG_DATA);

  userForm: FormGroup;

  constructor() {
    const user = this.data.user;
    const standardTipos = ['administrador', 'cliente', 'taller'];
    const isStandard = user?.tipo ? standardTipos.includes(user.tipo) : true;
    
    const initialTipo = user?.tipo ? (isStandard ? user.tipo : 'otros') : 'cliente';
    const initialTipoOtro = isStandard ? '' : user.tipo;

    this.userForm = this.fb.group({
      nombre: [user?.nombre || '', [Validators.required]],
      email: [user?.email || '', [Validators.required, Validators.email]],
      password: ['', user ? [Validators.minLength(6)] : [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', user ? [] : [Validators.required]],
      rol_ids: [user?.roles ? user.roles.map((r: Rol) => r.id) : [], [Validators.required]],
      tipo: [initialTipo, [Validators.required]],
      tipo_otro: [initialTipoOtro]
    }, { validators: this.passwordMatchValidator });

    // Validación condicional para tipo_otro
    this.userForm.get('tipo')?.valueChanges.subscribe(val => {
      const tipoOtroControl = this.userForm.get('tipo_otro');
      if (val === 'otros') {
        tipoOtroControl?.setValidators([Validators.required]);
      } else {
        tipoOtroControl?.clearValidators();
      }
      tipoOtroControl?.updateValueAndValidity();
    });
  }

  passwordMatchValidator(g: FormGroup) {
    const p = g.get('password')?.value;
    const cp = g.get('confirmPassword')?.value;
    if (!p && !cp) return null; // No se está cambiando la contraseña
    return p === cp ? null : { mismatch: true };
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.userForm.valid) {
      const { confirmPassword, tipo_otro, ...value } = this.userForm.value;
      
      // Mapear el tipo final
      if (value.tipo === 'otros') {
        value.tipo = tipo_otro;
      }
      
      // Si estamos editando y el password está vacío, lo quitamos para no enviarlo
      if (this.data.user && !value.password) {
        delete value.password;
      }
      
      this.dialogRef.close(value);
    }
  }
}
