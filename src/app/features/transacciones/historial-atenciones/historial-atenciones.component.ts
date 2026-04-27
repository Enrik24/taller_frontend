import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { ApiService } from '../../../core/services/api.service';
import { ToastNotificationService } from '../../../shared/components/toast-notification/toast-notification.service';

interface Atencion {
  id: number;
  fecha: string;
  cliente: string;
  vehiculo: string;
  taller: string;
  tipo_problema: string;
  estado: string;
  costo: number;
}

@Component({
  selector: 'app-historial-atenciones',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-container">
      <h2 class="page-title">
        <mat-icon class="title-icon">history</mat-icon>
        Ver Historial de Atenciones
      </h2>
      <p class="page-subtitle">Consulte el historial de servicios finalizados y atenciones en el sistema.</p>

      <mat-card class="filters-card">
        <mat-card-content>
          <form [formGroup]="filterForm" (ngSubmit)="loadHistorial()" class="filters-form">
            <mat-form-field appearance="outline">
              <mat-label>Fecha de inicio</mat-label>
              <input matInput [matDatepicker]="pickerInicio" formControlName="fechaInicio">
              <mat-datepicker-toggle matIconSuffix [for]="pickerInicio"></mat-datepicker-toggle>
              <mat-datepicker #pickerInicio></mat-datepicker>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Fecha de fin</mat-label>
              <input matInput [matDatepicker]="pickerFin" formControlName="fechaFin">
              <mat-datepicker-toggle matIconSuffix [for]="pickerFin"></mat-datepicker-toggle>
              <mat-datepicker #pickerFin></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Estado</mat-label>
              <mat-select formControlName="estado">
                <mat-option value="">Todos</mat-option>
                <mat-option value="Finalizado">Finalizado</mat-option>
                <mat-option value="Pagado">Pagado</mat-option>
                <mat-option value="Cancelado">Cancelado</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" [disabled]="loading()">
              <mat-icon>search</mat-icon> Consultar
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      @if (loading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <mat-card>
          <div class="table-container">
            <table mat-table [dataSource]="atencionesPaginadas()" class="historial-table">
              
              <!-- ID -->
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef> ID </th>
                <td mat-cell *matCellDef="let a"> #{{ a.id }} </td>
              </ng-container>

              <!-- Fecha -->
              <ng-container matColumnDef="fecha">
                <th mat-header-cell *matHeaderCellDef> Fecha </th>
                <td mat-cell *matCellDef="let a"> {{ a.fecha | date:'dd/MM/yyyy' }} </td>
              </ng-container>

              <!-- Cliente -->
              <ng-container matColumnDef="cliente">
                <th mat-header-cell *matHeaderCellDef> Cliente </th>
                <td mat-cell *matCellDef="let a"> {{ a.cliente }} </td>
              </ng-container>

              <!-- Taller -->
              <ng-container matColumnDef="taller">
                <th mat-header-cell *matHeaderCellDef> Taller </th>
                <td mat-cell *matCellDef="let a"> {{ a.taller }} </td>
              </ng-container>

              <!-- Tipo -->
              <ng-container matColumnDef="tipo_problema">
                <th mat-header-cell *matHeaderCellDef> Tipo Problema </th>
                <td mat-cell *matCellDef="let a"> {{ a.tipo_problema }} </td>
              </ng-container>

              <!-- Estado -->
              <ng-container matColumnDef="estado">
                <th mat-header-cell *matHeaderCellDef> Estado </th>
                <td mat-cell *matCellDef="let a"> 
                  <mat-chip [class]="'chip-' + a.estado.toLowerCase()">
                    {{ a.estado }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Costo -->
              <ng-container matColumnDef="costo">
                <th mat-header-cell *matHeaderCellDef> Costo </th>
                <td mat-cell *matCellDef="let a"> \${{ a.costo | number:'1.2-2' }} </td>
              </ng-container>

              <!-- Acciones -->
              <ng-container matColumnDef="acciones">
                <th mat-header-cell *matHeaderCellDef> Acciones </th>
                <td mat-cell *matCellDef="let a">
                  <button mat-icon-button color="primary" title="Ver detalles">
                    <mat-icon>visibility</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            @if (atenciones().length === 0) {
              <div class="empty-state">
                <mat-icon>history_toggle_off</mat-icon>
                <p>No se encontraron atenciones en el historial.</p>
              </div>
            }
          </div>

          <mat-paginator
            [length]="atenciones().length"
            [pageSize]="pageSize"
            [pageSizeOptions]="[5, 10, 25, 50]"
            (page)="onPage($event)"
            showFirstLastButtons>
          </mat-paginator>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .page-title { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; color: #333; }
    .title-icon { font-size: 28px; width: 28px; height: 28px; }
    .page-subtitle { color: #666; margin-bottom: 24px; font-size: 14px; }
    .filters-card { margin-bottom: 24px; }
    .filters-form { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; }
    .filters-form mat-form-field { flex: 1; min-width: 200px; }
    .loading-container { display: flex; justify-content: center; padding: 48px; }
    .table-container { overflow-x: auto; }
    .historial-table { width: 100%; min-width: 800px; }
    .chip-finalizado { background-color: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-pagado { background-color: #e3f2fd !important; color: #1565c0 !important; }
    .chip-cancelado { background-color: #ffebee !important; color: #c62828 !important; }
    .empty-state { text-align: center; padding: 48px 24px; color: #666; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; color: #ccc; margin-bottom: 16px; }
  `]
})
export class HistorialAtencionesComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastNotificationService);

  atenciones = signal<Atencion[]>([]);
  atencionesPaginadas = signal<Atencion[]>([]);
  loading = signal<boolean>(false);

  displayedColumns = ['id', 'fecha', 'cliente', 'taller', 'tipo_problema', 'estado', 'costo', 'acciones'];
  pageSize = 10;
  pageIndex = 0;

  filterForm = this.fb.group({
    fechaInicio: [null],
    fechaFin: [null],
    estado: ['']
  });

  ngOnInit() {
    this.loadHistorial();
  }

  loadHistorial() {
    this.loading.set(true);
    const vals = this.filterForm.value;
    const params = new URLSearchParams();
    
    if (vals.fechaInicio) params.append('fecha_inicio', new Date(vals.fechaInicio).toISOString());
    if (vals.fechaFin) params.append('fecha_fin', new Date(vals.fechaFin).toISOString());
    if (vals.estado) params.append('estado', vals.estado);
    
    const query = params.toString() ? '?' + params.toString() : '';

    this.api.get<Atencion[]>('atenciones/historial' + query).subscribe({
      next: (res) => {
        // Fallback demo data if endpoint doesn't exist
        if (!res) {
          res = [
            { id: 1001, fecha: '2026-04-10T10:30:00Z', cliente: 'Juan Perez', vehiculo: 'Toyota Corolla', taller: 'AutoFix Express', tipo_problema: 'Eléctrico', estado: 'Finalizado', costo: 120.50 },
            { id: 1002, fecha: '2026-04-15T14:45:00Z', cliente: 'Maria Gomez', vehiculo: 'Honda Civic', taller: 'Taller Central', tipo_problema: 'Mecánico', estado: 'Pagado', costo: 450.00 },
            { id: 1003, fecha: '2026-04-18T09:15:00Z', cliente: 'Carlos Ruiz', vehiculo: 'Ford Ranger', taller: 'Taller Rápido Norte', tipo_problema: 'Neumático', estado: 'Finalizado', costo: 45.00 },
            { id: 1004, fecha: '2026-04-20T16:20:00Z', cliente: 'Ana Lopez', vehiculo: 'Nissan Sentra', taller: 'MecánicaPro Sur', tipo_problema: 'Choque', estado: 'Cancelado', costo: 0 },
          ];
        }
        
        if (vals.estado) {
          res = res.filter(a => a.estado === vals.estado);
        }

        this.atenciones.set(res || []);
        this.paginar();
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Error al cargar historial de atenciones');
        this.loading.set(false);
      }
    });
  }

  paginar() {
    const start = this.pageIndex * this.pageSize;
    this.atencionesPaginadas.set(this.atenciones().slice(start, start + this.pageSize));
  }

  onPage(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.paginar();
  }
}
