import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Permiso } from '../../../../core/models';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      {{ data.role ? 'Editar Rol: ' + data.role.nombre : 'Crear Nuevo Rol' }}
    </h2>
    <mat-dialog-content>
      <form [formGroup]="roleForm" class="role-form">

        <mat-form-field appearance="outline">
          <mat-label>Nombre del Rol</mat-label>
          <input matInput formControlName="nombre" placeholder="Ej. Administrador">
          <mat-error *ngIf="roleForm.get('nombre')?.hasError('required')">El nombre es requerido</mat-error>
          <mat-error *ngIf="roleForm.get('nombre')?.hasError('minlength')">Mínimo 3 caracteres</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Descripción</mat-label>
          <textarea matInput formControlName="descripcion" rows="2" placeholder="Describe los permisos y propósito del rol"></textarea>
        </mat-form-field>

        <div class="permisos-section">
          <p class="section-label">PERMISOS</p>
          <div class="checkbox-list">
            <div *ngFor="let p of data.permisos; let i = index" class="checkbox-item">
              <mat-checkbox [checked]="isPermisoSelected(p.id)" (change)="onPermisoChange($event, p.id)">
                {{ p.nombre }}
              </mat-checkbox>
            </div>
          </div>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="start" class="dialog-actions">
      <button mat-flat-button color="primary" class="btn-guardar" [disabled]="roleForm.invalid" (click)="onSubmit()">Guardar</button>
      <button mat-flat-button class="btn-cancelar" (click)="onCancel()">Cancelar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title {
      font-weight: 700;
      font-size: 24px;
      color: #000;
      margin-bottom: 8px;
    }
    .role-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-top: 10px;
      min-width: 450px;
    }
    mat-form-field {
      width: 100%;
    }
    .section-label {
      font-size: 13px;
      font-weight: 600;
      color: #4b5563;
      margin: 0 0 8px;
      text-transform: uppercase;
    }
    .checkbox-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 200px;
      overflow-y: auto;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px;
      background: #fafafa;
    }
    .checkbox-item {
      display: flex;
      align-items: center;
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
    ::ng-deep .mat-mdc-form-field-label {
      font-weight: 500;
      color: #4b5563;
    }
  `]
})
export class RoleFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<RoleFormComponent>);
  public data = inject(MAT_DIALOG_DATA);

  roleForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: [''],
    permiso_ids: [[]]
  });

  ngOnInit() {
    if (this.data.role) {
      const permisoIds = this.data.role.permisos ? this.data.role.permisos.map((p: any) => p.id) : [];
      this.roleForm.patchValue({
        nombre: this.data.role.nombre,
        descripcion: this.data.role.descripcion,
        permiso_ids: permisoIds
      });
    }
  }

  isPermisoSelected(id: number): boolean {
    const ids = this.roleForm.get('permiso_ids')?.value || [];
    return ids.includes(id);
  }

  onPermisoChange(event: any, id: number) {
    const ids = [...(this.roleForm.get('permiso_ids')?.value || [])];
    if (event.checked) {
      ids.push(id);
    } else {
      const index = ids.indexOf(id);
      if (index > -1) {
        ids.splice(index, 1);
      }
    }
    this.roleForm.get('permiso_ids')?.setValue(ids);
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.roleForm.valid) {
      this.dialogRef.close(this.roleForm.value);
    }
  }
}
