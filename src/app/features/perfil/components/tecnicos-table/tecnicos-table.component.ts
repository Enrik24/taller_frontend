import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Tecnico } from '../../../../core/models';
import { ApiService } from '../../../../core/services/api.service';
import { firstValueFrom } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-tecnico-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data?.tecnico ? 'Editar Técnico' : 'Agregar Técnico' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="tecnico-form">
        <mat-form-field appearance="outline">
          <mat-label>Nombre Completo</mat-label>
          <input matInput formControlName="nombre" placeholder="Ej. Carlos Mendoza">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Especialidad</mat-label>
          <input matInput formControlName="especialidad" placeholder="Ej. Electricidad Automotriz">
        </mat-form-field>
        <mat-slide-toggle formControlName="disponible" color="primary">
          {{ form.get('disponible')?.value ? 'Disponible' : 'No Disponible' }}
        </mat-slide-toggle>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" [mat-dialog-close]="form.value">Guardar</button>
    </mat-dialog-actions>
  `,
  styles: `
    .tecnico-form { display: flex; flex-direction: column; gap: 16px; margin-top: 8px; min-width: 300px; padding-bottom: 16px; }
  `
})
export class TecnicoDialogComponent {
  form: FormGroup;
  data: any = inject(MAT_DIALOG_DATA);
  
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nombre: [this.data?.tecnico?.nombre || '', Validators.required],
      especialidad: [this.data?.tecnico?.especialidad || '', Validators.required],
      disponible: [this.data?.tecnico?.disponible ?? true]
    });
  }
}

@Component({
  selector: 'app-tecnicos-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule, MatChipsModule],
  template: `
    <div class="header-actions">
      <h3>Personal Técnico</h3>
      <button mat-flat-button color="primary" (click)="abrirDialogo()">
        <mat-icon>add</mat-icon> Agregar Técnico
      </button>
    </div>

    <table mat-table [dataSource]="tecnicos" class="mat-elevation-z2 mt-3">
      <ng-container matColumnDef="nombre">
        <th mat-header-cell *matHeaderCellDef> Nombre </th>
        <td mat-cell *matCellDef="let t"> {{t.nombre}} </td>
      </ng-container>

      <ng-container matColumnDef="especialidad">
        <th mat-header-cell *matHeaderCellDef> Especialidad </th>
        <td mat-cell *matCellDef="let t"> {{t.especialidad}} </td>
      </ng-container>

      <ng-container matColumnDef="disponible">
        <th mat-header-cell *matHeaderCellDef> Disponibilidad </th>
        <td mat-cell *matCellDef="let t">
          <mat-chip-set>
            <mat-chip [color]="t.disponible ? 'primary' : 'warn'" highlighted>
              {{ t.disponible ? 'Disponible' : 'No Disponible' }}
            </mat-chip>
          </mat-chip-set>
        </td>
      </ng-container>

      <ng-container matColumnDef="acciones">
        <th mat-header-cell *matHeaderCellDef> Acciones </th>
        <td mat-cell *matCellDef="let t">
          <button mat-icon-button color="primary" (click)="abrirDialogo(t)">
            <mat-icon>edit</mat-icon>
          </button>
          <button mat-icon-button color="warn" (click)="eliminar(t.id)">
            <mat-icon>delete</mat-icon>
          </button>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="columns"></tr>
      <tr mat-row *matRowDef="let row; columns: columns;"></tr>
      <tr class="mat-row" *matNoDataRow>
        <td class="mat-cell" colspan="4" style="text-align: center; padding: 24px;">No tienes técnicos registrados.</td>
      </tr>
    </table>
  `,
  styles: `
    .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .header-actions h3 { margin: 0; font-size: 20px; color: #333; }
    .mt-3 { margin-top: 16px; width: 100%; border-radius: 8px; overflow: hidden; }
  `
})
export class TecnicosTableComponent {
  @Input() tecnicos: Tecnico[] = [];
  @Output() cambio = new EventEmitter<void>();

  columns = ['nombre', 'especialidad', 'disponible', 'acciones'];
  private dialog = inject(MatDialog);
  private apiService = inject(ApiService);

  async abrirDialogo(tecnico?: Tecnico) {
    const dialogRef = this.dialog.open(TecnicoDialogComponent, {
      data: { tecnico },
      width: '400px'
    });

    const result = await firstValueFrom(dialogRef.afterClosed());
    if (result) {
      if (tecnico?.id) {
        try {
          await firstValueFrom(this.apiService.put(`perfil/tecnicos/${tecnico.id}`, result));
          this.cambio.emit();
        } catch(e) { 
          console.error('Error al editar técnico', e); 
          alert('Hubo un error al editar el técnico. Revisa la consola para más detalles.');
          this.cambio.emit(); 
        }
      } else {
        try {
          await firstValueFrom(this.apiService.post('perfil/tecnicos', result));
          this.cambio.emit();
        } catch(e) { 
          console.error('Error al crear técnico', e); 
          alert('Hubo un error al crear el técnico. Revisa la consola para más detalles.');
          this.cambio.emit(); 
        }
      }
    }
  }

  async eliminar(id: number) {
    if (confirm('¿Estás seguro de eliminar este técnico?')) {
      try {
        await firstValueFrom(this.apiService.delete(`perfil/tecnicos/${id}`));
        this.cambio.emit();
      } catch(e) {
        console.warn('Delete error', e);
        this.cambio.emit();
      }
    }
  }
}
