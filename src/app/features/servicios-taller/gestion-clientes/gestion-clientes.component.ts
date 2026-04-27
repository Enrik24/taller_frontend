import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../core/services/api.service';
import { firstValueFrom } from 'rxjs';
import { VehiculosClienteDialogComponent } from './vehiculos-cliente-dialog.component';

@Component({
  selector: 'app-gestion-clientes',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="page-header">
      <h2>Gestión de Clientes</h2>
      <p>Administra los usuarios registrados como clientes en la plataforma.</p>
    </div>

    @if (loading) {
      <div class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
    } @else {
    <table mat-table [dataSource]="clientes" class="mat-elevation-z2">
      <ng-container matColumnDef="id">
        <th mat-header-cell *matHeaderCellDef> ID </th>
        <td mat-cell *matCellDef="let c"> {{ c.id }} </td>
      </ng-container>

      <ng-container matColumnDef="nombre">
        <th mat-header-cell *matHeaderCellDef> Nombre Completo </th>
        <td mat-cell *matCellDef="let c"> {{ c.nombre }} </td>
      </ng-container>

      <ng-container matColumnDef="email">
        <th mat-header-cell *matHeaderCellDef> Email </th>
        <td mat-cell *matCellDef="let c"> {{ c.email }} </td>
      </ng-container>

      <ng-container matColumnDef="telefono">
        <th mat-header-cell *matHeaderCellDef> Teléfono </th>
        <td mat-cell *matCellDef="let c"> {{ c.telefono || 'N/A' }} </td>
      </ng-container>

      <ng-container matColumnDef="fecha_registro">
        <th mat-header-cell *matHeaderCellDef> Fecha de Registro </th>
        <td mat-cell *matCellDef="let c"> {{ (c.fecha_creacion | date:'dd/MM/yyyy') || 'N/A' }} </td>
      </ng-container>

      <ng-container matColumnDef="estado">
        <th mat-header-cell *matHeaderCellDef> Estado </th>
        <td mat-cell *matCellDef="let c">
          <mat-chip [color]="c.activo ? 'primary' : 'warn'" highlighted>
            {{ c.activo ? 'Activo' : 'Bloqueado' }}
          </mat-chip>
        </td>
      </ng-container>

      <ng-container matColumnDef="acciones">
        <th mat-header-cell *matHeaderCellDef> Acciones </th>
        <td mat-cell *matCellDef="let c">
          <button mat-icon-button color="primary" matTooltip="Ver Vehículos" (click)="verVehiculos(c.id)">
            <mat-icon>directions_car</mat-icon>
          </button>
          <button mat-icon-button color="warn" matTooltip="Bloquear Cuenta">
            <mat-icon>lock</mat-icon>
          </button>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="columns"></tr>
      <tr mat-row *matRowDef="let row; columns: columns;"></tr>
      <tr class="mat-row" *matNoDataRow>
        <td class="mat-cell text-center" colspan="7">No se encontraron clientes registrados.</td>
      </tr>
    </table>
    }
  `,
  styles: [`
    .page-header { margin-bottom: 24px; }
    .page-header h2 { margin: 0; font-size: 24px; color: #333; }
    .page-header p { margin: 8px 0 0; color: #666; }
    .loading-container { display: flex; justify-content: center; align-items: center; padding: 48px; }
    table { width: 100%; border-radius: 8px; overflow: hidden; }
    .text-center { text-align: center; padding: 24px; }
  `]
})
export class GestionClientesComponent implements OnInit {
  clientes: any[] = [];
  loading = true;
  columns = ['id', 'nombre', 'email', 'telefono', 'fecha_registro', 'estado', 'acciones'];
  
  private apiService = inject(ApiService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  async ngOnInit() {
    this.loading = true;
    try {
      const response = await firstValueFrom(this.apiService.get<any>('admin/usuarios?rol=cliente'));
      this.clientes = Array.isArray(response) ? response : (response?.data || []);
    } catch (e) {
      console.error('Error fetching clientes:', e);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  verVehiculos(clienteId: number) {
    this.dialog.open(VehiculosClienteDialogComponent, {
      data: { clienteId },
      width: '600px'
    });
  }
}
