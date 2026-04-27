import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { ApiService } from '../../../core/services/api.service';
import { ToastNotificationService } from '../../../shared/components/toast-notification/toast-notification.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

interface SolicitudPendiente {
  id: number;
  distancia_km: number;
  tipo_problema: string;
  prioridad: string;
  descripcion: string;
  fecha: string;
  estado: string;
  cliente_nombre: string;
}

@Component({
  selector: 'app-aceptar-rechazar',
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
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatDialogModule,
    MatTooltipModule,
    MatPaginatorModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-container">
      <h2 class="page-title">
        <mat-icon class="title-icon">check_circle</mat-icon>
        Aceptar o Rechazar Solicitud
      </h2>
      <p class="page-subtitle">Gestione las solicitudes pendientes. Rechazar abre un modal con campo motivo obligatorio.</p>

      <!-- Filtros -->
      <mat-card class="filters-card">
        <mat-card-content>
          <form [formGroup]="filterForm" (ngSubmit)="loadSolicitudes()" class="filters-form">
            <mat-form-field appearance="outline">
              <mat-label>Tipo de Problema</mat-label>
              <mat-select formControlName="tipoProblema">
                <mat-option value="">Todos</mat-option>
                <mat-option value="Mecánico">Mecánico</mat-option>
                <mat-option value="Eléctrico">Eléctrico</mat-option>
                <mat-option value="Choque">Choque</mat-option>
                <mat-option value="Neumático">Neumático</mat-option>
                <mat-option value="Otro">Otro</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Prioridad</mat-label>
              <mat-select formControlName="prioridad">
                <mat-option value="">Todas</mat-option>
                <mat-option value="Alta">Alta</mat-option>
                <mat-option value="Media">Media</mat-option>
                <mat-option value="Baja">Baja</mat-option>
              </mat-select>
            </mat-form-field>
            <button mat-raised-button color="primary" type="submit" [disabled]="loading()">
              <mat-icon>filter_list</mat-icon> Filtrar
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
          <table mat-table [dataSource]="solicitudesPaginadas()" class="solicitudes-table">
            <!-- ID -->
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let s">#{{ s.id }}</td>
            </ng-container>

            <!-- Distancia -->
            <ng-container matColumnDef="distancia">
              <th mat-header-cell *matHeaderCellDef>Distancia</th>
              <td mat-cell *matCellDef="let s">{{ s.distancia_km }} km</td>
            </ng-container>

            <!-- Tipo Problema -->
            <ng-container matColumnDef="tipo_problema">
              <th mat-header-cell *matHeaderCellDef>Tipo Problema</th>
              <td mat-cell *matCellDef="let s">{{ s.tipo_problema }}</td>
            </ng-container>

            <!-- Prioridad -->
            <ng-container matColumnDef="prioridad">
              <th mat-header-cell *matHeaderCellDef>Prioridad</th>
              <td mat-cell *matCellDef="let s">
                <mat-chip [class]="'chip-prioridad-' + s.prioridad.toLowerCase()">
                  {{ s.prioridad }}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Acciones -->
            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let s">
                <button mat-icon-button color="primary" matTooltip="Aceptar solicitud" (click)="aceptarSolicitud(s.id)">
                  <mat-icon>check_circle</mat-icon>
                </button>
                <button mat-icon-button color="warn" matTooltip="Rechazar solicitud" (click)="rechazarSolicitud(s.id)">
                  <mat-icon>cancel</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          @if (solicitudes().length === 0) {
            <div class="empty-state">
              <mat-icon>inbox</mat-icon>
              <p>No hay solicitudes pendientes de aceptar o rechazar.</p>
            </div>
          }

          <mat-paginator
            [length]="solicitudes().length"
            [pageSize]="pageSize"
            [pageSizeOptions]="[5, 10, 25]"
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
    .solicitudes-table { width: 100%; }
    .chip-prioridad-alta { background-color: #ffebee !important; color: #c62828 !important; }
    .chip-prioridad-media { background-color: #fff3e0 !important; color: #e65100 !important; }
    .chip-prioridad-baja { background-color: #e8f5e9 !important; color: #2e7d32 !important; }
    .empty-state { text-align: center; padding: 48px 24px; color: #666; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; color: #ccc; margin-bottom: 16px; }
  `]
})
export class AceptarRechazarComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastNotificationService);
  private dialog = inject(MatDialog);

  solicitudes = signal<SolicitudPendiente[]>([]);
  solicitudesPaginadas = signal<SolicitudPendiente[]>([]);
  loading = signal<boolean>(false);

  displayedColumns = ['id', 'distancia', 'tipo_problema', 'prioridad', 'acciones'];
  pageSize = 10;
  pageIndex = 0;

  filterForm = this.fb.group({
    tipoProblema: [''],
    prioridad: ['']
  });

  ngOnInit() {
    this.loadSolicitudes();
  }

  loadSolicitudes() {
    this.loading.set(true);
    const vals = this.filterForm.value;
    const params = new URLSearchParams();
    if (vals.tipoProblema) params.append('tipo', vals.tipoProblema);
    if (vals.prioridad) params.append('prioridad', vals.prioridad);
    const query = params.toString() ? '?' + params.toString() : '';

    this.api.get<SolicitudPendiente[]>('solicitudes/pendientes' + query).subscribe({
      next: (res) => {
        this.solicitudes.set(res || []);
        this.paginar();
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Error al cargar solicitudes');
        this.loading.set(false);
      }
    });
  }

  paginar() {
    const start = this.pageIndex * this.pageSize;
    this.solicitudesPaginadas.set(this.solicitudes().slice(start, start + this.pageSize));
  }

  onPage(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.paginar();
  }

  aceptarSolicitud(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Aceptar solicitud',
        message: '¿Está seguro de que desea aceptar esta solicitud y asignarla a su taller?'
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loading.set(true);
        this.api.post(`solicitudes/${id}/aceptar`, {}).subscribe({
          next: () => {
            this.toast.success('Solicitud aceptada correctamente');
            this.loadSolicitudes();
          },
          error: () => {
            this.toast.error('Error al aceptar la solicitud');
            this.loading.set(false);
          }
        });
      }
    });
  }

  rechazarSolicitud(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Rechazar solicitud',
        message: 'Por favor, indique el motivo por el cual rechaza la solicitud (obligatorio):',
        showInput: true
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe(motivo => {
      if (typeof motivo === 'string' && motivo.trim() !== '') {
        this.loading.set(true);
        this.api.post(`solicitudes/${id}/rechazar`, { motivo }).subscribe({
          next: () => {
            this.toast.info('Solicitud rechazada');
            this.loadSolicitudes();
          },
          error: () => {
            this.toast.error('Error al rechazar la solicitud');
            this.loading.set(false);
          }
        });
      } else if (motivo === true) {
        this.toast.warning('Debe proporcionar un motivo para rechazar la solicitud');
      }
    });
  }
}
