import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { ComisionTableComponent } from '../components/comision-table/comision-table.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';

interface ResumenComisiones {
  total_recaudado: number;
  comisiones_del_mes: number;
}

@Component({
  selector: 'app-comisiones',
  standalone: true,
  imports: [
    CommonModule,
    ComisionTableComponent,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="comisiones-page">
      <div class="header">
        <h1>Gestión de Comisiones</h1>
        <p>Panel de administración de ingresos por plataforma</p>
      </div>

      <ng-container *ngIf="loading()">
        <div class="loading-state">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Cargando información de comisiones...</p>
        </div>
      </ng-container>

      <ng-container *ngIf="!loading()">
        <div class="summary-cards">
          <mat-card class="summary-card">
            <mat-icon class="icon primary">account_balance</mat-icon>
            <div class="card-content">
              <span class="label">Total Recaudado</span>
              <span class="amount">\${{ resumen()?.total_recaudado | number:'1.2-2' }}</span>
            </div>
          </mat-card>

          <mat-card class="summary-card">
            <mat-icon class="icon accent">date_range</mat-icon>
            <div class="card-content">
              <span class="label">Comisiones del Mes</span>
              <span class="amount">\${{ resumen()?.comisiones_del_mes | number:'1.2-2' }}</span>
            </div>
          </mat-card>
        </div>

        <div class="table-section">
          <h2>Desglose de Comisiones</h2>
          <app-comision-table [comisiones]="comisiones()"></app-comision-table>
        </div>
      </ng-container>
    </div>
  `,
  styles: `
    .comisiones-page {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      margin-bottom: 32px;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      color: #333;
    }
    .header p {
      margin: 8px 0 0;
      color: #666;
    }
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 48px;
      color: #666;
    }
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }
    .summary-card {
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 24px;
      gap: 24px;
    }
    .icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }
    .icon.primary { color: #1976d2; }
    .icon.accent { color: #ff9800; }
    .card-content {
      display: flex;
      flex-direction: column;
    }
    .card-content .label {
      font-size: 14px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .card-content .amount {
      font-size: 32px;
      font-weight: bold;
      color: #333;
    }
    .table-section {
      margin-top: 32px;
    }
    .table-section h2 {
      font-size: 20px;
      margin-bottom: 16px;
      color: #444;
    }
  `
})
export class ComisionesComponent implements OnInit {
  private apiService = inject(ApiService);

  comisiones = signal<any[]>([]);
  resumen = signal<ResumenComisiones | null>(null);
  loading = signal<boolean>(true);

  async ngOnInit() {
    this.loading.set(true);
    await Promise.all([
      this.loadResumen(),
      this.loadComisiones()
    ]);
    this.loading.set(false);
  }

  async loadComisiones() {
    try {
      const data = await firstValueFrom(this.apiService.get<any[]>('admin/comisiones'));
      this.comisiones.set(data || []);
    } catch (e) {
      console.warn('Could not fetch comisiones, using fallback data', e);
      this.comisiones.set([
        { id: 1, solicitud_id: 101, monto: 15.00, porcentaje: 10, estado: 'Pagado', fecha_registro: new Date().toISOString() },
        { id: 2, solicitud_id: 105, monto: 20.00, porcentaje: 10, estado: 'Pendiente', fecha_registro: new Date().toISOString() },
      ]);
    }
  }

  async loadResumen() {
    try {
      const data = await firstValueFrom(this.apiService.get<ResumenComisiones>('admin/comisiones/resumen'));
      this.resumen.set(data);
    } catch (e) {
      console.warn('Could not fetch comisiones resumen, using fallback data', e);
      this.resumen.set({
        total_recaudado: 350.50,
        comisiones_del_mes: 85.00
      });
    }
  }
}
