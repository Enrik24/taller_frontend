import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../core/services/api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-vehiculos-cliente-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>Vehículos del Cliente (ID: {{ data.clienteId }})</h2>
    <mat-dialog-content>
      @if (loading) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <table mat-table [dataSource]="vehiculos" class="mat-elevation-z1">
          <ng-container matColumnDef="placa">
            <th mat-header-cell *matHeaderCellDef> Placa </th>
            <td mat-cell *matCellDef="let v"> <strong>{{ v.placa }}</strong> </td>
          </ng-container>

          <ng-container matColumnDef="marca">
            <th mat-header-cell *matHeaderCellDef> Marca </th>
            <td mat-cell *matCellDef="let v"> {{ v.marca }} </td>
          </ng-container>

          <ng-container matColumnDef="modelo">
            <th mat-header-cell *matHeaderCellDef> Modelo </th>
            <td mat-cell *matCellDef="let v"> {{ v.modelo }} </td>
          </ng-container>

          <ng-container matColumnDef="anio">
            <th mat-header-cell *matHeaderCellDef> Año </th>
            <td mat-cell *matCellDef="let v"> {{ v.anio }} </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell text-center" colspan="4">Este cliente no tiene vehículos registrados.</td>
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
export class VehiculosClienteDialogComponent implements OnInit {
  data: { clienteId: number } = inject(MAT_DIALOG_DATA);
  private apiService = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  
  vehiculos: any[] = [];
  loading = true;
  columns = ['placa', 'marca', 'modelo', 'anio'];

  async ngOnInit() {
    try {
      const response = await firstValueFrom(this.apiService.get<any>(`admin/clientes/${this.data.clienteId}/vehiculos`));
      this.vehiculos = Array.isArray(response) ? response : (response?.data || []);
    } catch (e) {
      console.error('Error cargando vehículos', e);
      this.vehiculos = [];
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
}
