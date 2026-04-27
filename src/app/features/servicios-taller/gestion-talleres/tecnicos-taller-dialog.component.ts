import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../../core/services/api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-tecnicos-taller-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>Técnicos del Taller (ID: {{ data.tallerId }})</h2>
    <mat-dialog-content>
      @if (loading) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <table mat-table [dataSource]="tecnicos" class="mat-elevation-z1">
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef> ID </th>
            <td mat-cell *matCellDef="let t"> {{ t.id }} </td>
          </ng-container>

          <ng-container matColumnDef="nombre">
            <th mat-header-cell *matHeaderCellDef> Nombre </th>
            <td mat-cell *matCellDef="let t"> {{ t.nombre }} </td>
          </ng-container>

          <ng-container matColumnDef="especialidad">
            <th mat-header-cell *matHeaderCellDef> Especialidad </th>
            <td mat-cell *matCellDef="let t"> {{ t.especialidad || 'General' }} </td>
          </ng-container>

          <ng-container matColumnDef="disponible">
            <th mat-header-cell *matHeaderCellDef> Disponibilidad </th>
            <td mat-cell *matCellDef="let t">
              <mat-chip [color]="t.disponible ? 'primary' : 'warn'" highlighted>
                {{ t.disponible ? 'Disponible' : 'Ocupado' }}
              </mat-chip>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell text-center" colspan="4">No hay técnicos registrados para este taller.</td>
          </tr>
        </table>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cerrar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .loading-container { display: flex; justify-content: center; padding: 24px; }
    table { width: 100%; margin-top: 8px; }
    .text-center { text-align: center; padding: 24px; }
  `]
})
export class TecnicosTallerDialogComponent implements OnInit {
  data: { tallerId: number } = inject(MAT_DIALOG_DATA);
  private apiService = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  
  tecnicos: any[] = [];
  loading = true;
  columns = ['id', 'nombre', 'especialidad', 'disponible'];

  async ngOnInit() {
    try {
      const response = await firstValueFrom(this.apiService.get<any>(`admin/talleres/${this.data.tallerId}/tecnicos`));
      this.tecnicos = Array.isArray(response) ? response : (response?.data || []);
    } catch (e) {
      console.error('Error cargando técnicos', e);
      this.tecnicos = [];
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
}
