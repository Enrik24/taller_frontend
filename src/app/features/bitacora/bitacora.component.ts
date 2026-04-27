import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LogFiltersComponent, LogFilters } from './components/log-filters/log-filters.component';
import { LogTableComponent } from './components/log-table/log-table.component';
import { BitacoraService } from '../../core/services/bitacora.service';
import { ToastNotificationService } from '../../shared/components/toast-notification/toast-notification.service';
import { BitacoraEntry } from '../../core/models';
import { format } from 'date-fns';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-bitacora',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, LogFiltersComponent, LogTableComponent],
  template: `
    <div class="bitacora-page p-6">
      <div class="header">
        <div class="title-container">
          <mat-icon class="title-icon">history</mat-icon>
          <div>
            <h2 class="text-2xl font-bold">Bitácora del Sistema</h2>
            <p class="subtitle">Registro de auditoría y actividades</p>
          </div>
        </div>
      </div>

      <app-log-filters (filtersChanged)="applyFilters($event)"></app-log-filters>

      <div class="actions">
        <button mat-flat-button color="primary" class="export-btn" (click)="exportCSV()" [disabled]="loading()">
          <mat-icon>download</mat-icon> Exportar CSV
        </button>
      </div>

      <app-log-table 
        [data]="logs()" 
        [loading]="loading()" 
        [totalRecords]="totalRecords()"
        [pageSize]="pageSize()"
        (pageChange)="handlePageChange($event)">
      </app-log-table>
    </div>
  `,
  styles: [`
    .bitacora-page {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
      color: #333;
    }
    .header {
      margin-bottom: 8px;
    }
    .title-container {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .title-icon {
      font-size: 2.5rem;
      width: 40px;
      height: 40px;
      color: #4ecdc4;
    }
    h2 {
      font-size: 1.8rem;
      font-weight: 800;
      margin: 0 0 4px 0;
      background: linear-gradient(135deg,#6c63ff,#4ecdc4);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle {
      margin: 0;
      color: #888;
      font-size: 0.9rem;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 16px;
    }
    .export-btn {
      background: linear-gradient(135deg,#6c63ff,#4ecdc4) !important;
      color: white !important;
      border-radius: 10px;
    }
  `]
})
export class BitacoraComponent implements OnInit {
  private bitacoraService = inject(BitacoraService);
  private toastService = inject(ToastNotificationService);

  logs = signal<BitacoraEntry[]>([]);
  loading = signal<boolean>(false);
  totalRecords = signal<number>(0);
  page = signal<number>(1);
  pageSize = signal<number>(25);
  filters = signal<LogFilters | null>(null);

  ngOnInit() {
    this.loadLogs();
  }

  applyFilters(newFilters: LogFilters) {
    this.filters.set(newFilters);
    this.page.set(1); // Reset to first page on filter change
    this.loadLogs();
  }

  handlePageChange(event: PageEvent) {
    this.page.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadLogs();
  }

  private buildQueryParams(): any {
    const params: any = {
      page: this.page(),
      page_size: this.pageSize()
    };
    
    const currFilter = this.filters();
    if (currFilter) {
      if (currFilter.fecha_desde) params.fecha_desde = format(currFilter.fecha_desde, 'yyyy-MM-dd');
      if (currFilter.fecha_hasta) params.fecha_hasta = format(currFilter.fecha_hasta, 'yyyy-MM-dd');
      if (currFilter.entidad_afectada) params.entidad_afectada = currFilter.entidad_afectada;
      if (currFilter.accion) params.accion = currFilter.accion;
      if (currFilter.id_usuario) params.id_usuario = currFilter.id_usuario;
    }
    
    return params;
  }

  loadLogs() {
    this.loading.set(true);
    const params = this.buildQueryParams();
    console.log('[Bitacora] Solicitando logs con parámetros:', params);
    
    this.bitacoraService.getLogs(params).subscribe({
      next: (res) => {
        console.log('[Bitacora] Respuesta del servidor:', res);
        this.logs.set(res.logs || []);
        this.totalRecords.set(res.pagination?.total || 0);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('[Bitacora] Error en la petición:', err);
        this.toastService.warning('Error de conexión con el backend (500). Usando datos de prueba.');
        this.loadMockData();
        this.loading.set(false);
      }
    });
  }

  private loadMockData() {
    const mockData: BitacoraEntry[] = [
      {
        id: 1,
        fecha_hora: new Date().toISOString(),
        accion: 'UPDATE',
        entidad_afectada: 'Usuarios',
        ip_origen: '192.168.1.1',
        usuario: 'admin@test.com'
      },
      {
        id: 2,
        fecha_hora: new Date().toISOString(),
        accion: 'CREATE',
        entidad_afectada: 'Roles',
        ip_origen: '192.168.1.5',
        usuario: 'juan@test.com'
      }
    ];
    this.logs.set(mockData);
    this.totalRecords.set(2);
  }

  exportCSV() {
    this.toastService.success('Preparando exportación...');
    const currFilter = this.filters();
    const fechaDesde = currFilter?.fecha_desde ? format(currFilter.fecha_desde, 'yyyy-MM-dd') : undefined;
    const fechaHasta = currFilter?.fecha_hasta ? format(currFilter.fecha_hasta, 'yyyy-MM-dd') : undefined;

    this.bitacoraService.exportarCSV(fechaDesde, fechaHasta).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `bitacora_export_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.toastService.success('Archivo CSV exportado exitosamente');
      },
      error: (err) => {
        console.error('[Bitacora] Error en exportación:', err);
        this.toastService.error('Error al exportar el archivo CSV.');
      }
    });
  }
}
