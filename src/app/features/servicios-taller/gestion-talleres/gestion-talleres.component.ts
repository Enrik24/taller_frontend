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
import { TecnicosTallerDialogComponent } from './tecnicos-taller-dialog.component';

@Component({
  selector: 'app-gestion-talleres',
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
      <h2>Gestión de Talleres</h2>
      <p>Administra los talleres registrados en la plataforma.</p>
    </div>

    @if (loading) {
      <div class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
    } @else {
    <table mat-table [dataSource]="talleres" class="mat-elevation-z2">
      <ng-container matColumnDef="id">
        <th mat-header-cell *matHeaderCellDef> ID </th>
        <td mat-cell *matCellDef="let t"> {{ t.id }} </td>
      </ng-container>

      <ng-container matColumnDef="nombre_comercial">
        <th mat-header-cell *matHeaderCellDef> Nombre Comercial </th>
        <td mat-cell *matCellDef="let t"> {{ t.nombre_comercial || 'N/A' }} </td>
      </ng-container>

      <ng-container matColumnDef="nombre">
        <th mat-header-cell *matHeaderCellDef> Propietario </th>
        <td mat-cell *matCellDef="let t"> {{ t.nombre }} </td>
      </ng-container>

      <ng-container matColumnDef="email">
        <th mat-header-cell *matHeaderCellDef> Email </th>
        <td mat-cell *matCellDef="let t"> {{ t.email }} </td>
      </ng-container>

      <ng-container matColumnDef="direccion">
        <th mat-header-cell *matHeaderCellDef> Dirección </th>
        <td mat-cell *matCellDef="let t"> {{ t.direccion || t.direccion_default || 'N/A' }} </td>
      </ng-container>

      <ng-container matColumnDef="estado">
        <th mat-header-cell *matHeaderCellDef> Estado </th>
        <td mat-cell *matCellDef="let t">
          <mat-chip [color]="t.activo ? 'primary' : 'warn'" highlighted>
            {{ t.activo ? 'Activo' : 'Inactivo' }}
          </mat-chip>
        </td>
      </ng-container>

      <ng-container matColumnDef="calificacion">
        <th mat-header-cell *matHeaderCellDef> Calificación </th>
        <td mat-cell *matCellDef="let t">
          <div style="display: flex; align-items: center; gap: 4px;">
            <mat-icon style="color: #ffc107; font-size: 18px; width: 18px; height: 18px;">star</mat-icon>
            {{ t.calificacion || '4.5' }}
          </div>
        </td>
      </ng-container>

      <ng-container matColumnDef="acciones">
        <th mat-header-cell *matHeaderCellDef> Acciones </th>
        <td mat-cell *matCellDef="let t">
          <button mat-icon-button color="primary" matTooltip="Ver Técnicos" (click)="verTecnicos(t.id)">
            <mat-icon>engineering</mat-icon>
          </button>
          <button mat-icon-button color="accent" matTooltip="Editar">
            <mat-icon>edit</mat-icon>
          </button>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="columns"></tr>
      <tr mat-row *matRowDef="let row; columns: columns;"></tr>
      <tr class="mat-row" *matNoDataRow>
        <td class="mat-cell text-center" colspan="8">No se encontraron talleres registrados.</td>
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
export class GestionTalleresComponent implements OnInit {
  talleres: any[] = [];
  loading = true;
  columns = ['id', 'nombre_comercial', 'nombre', 'email', 'direccion', 'estado', 'calificacion', 'acciones'];
  
  private apiService = inject(ApiService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  async ngOnInit() {
    this.loading = true;
    try {
      const response = await firstValueFrom(this.apiService.get<any>('admin/usuarios?rol=taller'));
      this.talleres = Array.isArray(response) ? response : (response?.data || []);
    } catch (e) {
      console.error('Error fetching talleres:', e);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  verTecnicos(tallerId: number) {
    this.dialog.open(TecnicosTallerDialogComponent, {
      data: { tallerId },
      width: '600px'
    });
  }
}
