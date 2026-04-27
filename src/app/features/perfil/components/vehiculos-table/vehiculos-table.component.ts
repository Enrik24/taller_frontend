import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Vehiculo } from '../../../../core/models';
import { ApiService } from '../../../../core/services/api.service';
import { firstValueFrom } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-vehiculo-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data?.vehiculo ? 'Editar Vehículo' : 'Agregar Vehículo' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="vehiculo-form">
        <mat-form-field appearance="outline">
          <mat-label>Marca</mat-label>
          <input matInput formControlName="marca" placeholder="Ej. Toyota">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Modelo</mat-label>
          <input matInput formControlName="modelo" placeholder="Ej. Corolla">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Año</mat-label>
          <input matInput formControlName="anio" type="number" placeholder="Ej. 2020">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Placa</mat-label>
          <input matInput formControlName="placa" placeholder="Ej. ABC1234">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" [mat-dialog-close]="form.value">Guardar</button>
    </mat-dialog-actions>
  `,
  styles: `
    .vehiculo-form { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; min-width: 300px; }
  `
})
export class VehiculoDialogComponent {
  form: FormGroup;
  data: any = inject('MAT_DIALOG_DATA' as any);
  
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      marca: [this.data?.vehiculo?.marca || '', Validators.required],
      modelo: [this.data?.vehiculo?.modelo || '', Validators.required],
      anio: [this.data?.vehiculo?.anio || '', [Validators.required, Validators.min(1900)]],
      placa: [this.data?.vehiculo?.placa || '', Validators.required]
    });
  }
}

@Component({
  selector: 'app-vehiculos-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule],
  template: `
    <div class="header-actions">
      <h3>Mis Vehículos</h3>
      <button mat-flat-button color="primary" (click)="abrirDialogo()">
        <mat-icon>add</mat-icon> Agregar Vehículo
      </button>
    </div>

    <table mat-table [dataSource]="vehiculos" class="mat-elevation-z2 mt-3">
      <ng-container matColumnDef="marca">
        <th mat-header-cell *matHeaderCellDef> Marca </th>
        <td mat-cell *matCellDef="let v"> {{v.marca}} </td>
      </ng-container>

      <ng-container matColumnDef="modelo">
        <th mat-header-cell *matHeaderCellDef> Modelo </th>
        <td mat-cell *matCellDef="let v"> {{v.modelo}} </td>
      </ng-container>

      <ng-container matColumnDef="anio">
        <th mat-header-cell *matHeaderCellDef> Año </th>
        <td mat-cell *matCellDef="let v"> {{v.anio}} </td>
      </ng-container>

      <ng-container matColumnDef="placa">
        <th mat-header-cell *matHeaderCellDef> Placa </th>
        <td mat-cell *matCellDef="let v"> <span class="badge">{{v.placa}}</span> </td>
      </ng-container>

      <ng-container matColumnDef="acciones">
        <th mat-header-cell *matHeaderCellDef> Acciones </th>
        <td mat-cell *matCellDef="let v">
          <button mat-icon-button color="primary" (click)="abrirDialogo(v)">
            <mat-icon>edit</mat-icon>
          </button>
          <button mat-icon-button color="warn" (click)="eliminar(v.id)">
            <mat-icon>delete</mat-icon>
          </button>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="columns"></tr>
      <tr mat-row *matRowDef="let row; columns: columns;"></tr>
      <tr class="mat-row" *matNoDataRow>
        <td class="mat-cell" colspan="5" style="text-align: center; padding: 24px;">No tienes vehículos registrados.</td>
      </tr>
    </table>
  `,
  styles: `
    .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .header-actions h3 { margin: 0; font-size: 20px; color: #333; }
    .mt-3 { margin-top: 16px; width: 100%; border-radius: 8px; overflow: hidden; }
    .badge { background: #e0e0e0; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-weight: bold; }
  `
})
export class VehiculosTableComponent {
  @Input() vehiculos: Vehiculo[] = [];
  @Output() cambio = new EventEmitter<void>();

  columns = ['marca', 'modelo', 'anio', 'placa', 'acciones'];
  private dialog = inject(MatDialog);
  private apiService = inject(ApiService);

  async abrirDialogo(vehiculo?: Vehiculo) {
    const dialogRef = this.dialog.open(VehiculoDialogComponent, {
      data: { vehiculo },
      width: '400px'
    });

    const result = await firstValueFrom(dialogRef.afterClosed());
    if (result) {
      if (vehiculo?.id) {
        // Edit logic can be added here if backend supports PUT /api/perfil/vehiculos/:id
        // We'll mimic creation or update
        try {
          await firstValueFrom(this.apiService.put(`perfil/vehiculos/${vehiculo.id}`, result));
          this.cambio.emit();
        } catch(e) { console.warn('Edit error', e); this.cambio.emit(); }
      } else {
        try {
          await firstValueFrom(this.apiService.post('perfil/vehiculos', result));
          this.cambio.emit();
        } catch(e) { console.warn('Create error', e); this.cambio.emit(); }
      }
    }
  }

  async eliminar(id: number) {
    if (confirm('¿Estás seguro de eliminar este vehículo?')) {
      try {
        await firstValueFrom(this.apiService.delete(`perfil/vehiculos/${id}`));
        this.cambio.emit();
      } catch(e) {
        console.warn('Delete error', e);
        this.cambio.emit();
      }
    }
  }
}
