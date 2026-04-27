import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';

import { ApiService } from '../../../core/services/api.service';
import { ToastNotificationService } from '../../../shared/components/toast-notification/toast-notification.service';

interface SolicitudIA {
  id: number;
  descripcion: string;
  resumen_ia: string;
  tipo_problema: string;
  prioridad: string;
  fecha: string;
  estado: string;
}

@Component({
  selector: 'app-consultar-info-ia',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTableModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-container">
      <h2 class="page-title">
        <mat-icon class="title-icon">smart_toy</mat-icon>
        Consultar Información Enriquecida
      </h2>
      <p class="page-subtitle">Pestaña dentro del detalle de solicitud. Muestra: resumen IA, tipo de problema y prioridad.</p>

      <!-- Selector de solicitud -->
      <mat-card class="selector-card">
        <mat-card-content>
          <form [formGroup]="filterForm" (ngSubmit)="buscarSolicitud()" class="search-form">
            <mat-form-field appearance="outline">
              <mat-label>ID de Solicitud</mat-label>
              <input matInput type="number" formControlName="solicitudId" placeholder="Ej. 101" />
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
      }

      @if (solicitudDetalle()) {
        <mat-card class="detalle-card">
          <mat-tab-group animationDuration="300ms">
            <!-- Pestaña general -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon class="tab-icon">info</mat-icon>
                Información General
              </ng-template>
              <div class="tab-content">
                <div class="info-grid">
                  <div class="info-item">
                    <span class="label">ID Solicitud</span>
                    <span class="value">#{{ solicitudDetalle()!.id }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Estado</span>
                    <mat-chip [class]="'chip-' + solicitudDetalle()!.estado.toLowerCase()">
                      {{ solicitudDetalle()!.estado }}
                    </mat-chip>
                  </div>
                  <div class="info-item">
                    <span class="label">Fecha</span>
                    <span class="value">{{ solicitudDetalle()!.fecha }}</span>
                  </div>
                  <div class="info-item full-width">
                    <span class="label">Descripción</span>
                    <span class="value">{{ solicitudDetalle()!.descripcion }}</span>
                  </div>
                </div>
              </div>
            </mat-tab>

            <!-- Pestaña de análisis IA -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon class="tab-icon">psychology</mat-icon>
                Análisis IA
              </ng-template>
              <div class="tab-content">
                <div class="ia-section">
                  <div class="ia-header">
                    <mat-icon class="ia-icon">auto_awesome</mat-icon>
                    <h3>Resumen generado por IA</h3>
                  </div>
                  <div class="ia-resumen">
                    <p>{{ solicitudDetalle()!.resumen_ia || 'Análisis IA pendiente de procesamiento.' }}</p>
                  </div>
                </div>

                <div class="ia-details-grid">
                  <mat-card class="ia-detail-card">
                    <mat-icon class="detail-icon" color="primary">build</mat-icon>
                    <h4>Tipo de Problema</h4>
                    <mat-chip color="primary" highlighted>
                      {{ solicitudDetalle()!.tipo_problema || 'Sin clasificar' }}
                    </mat-chip>
                  </mat-card>
                  <mat-card class="ia-detail-card">
                    <mat-icon class="detail-icon" [class]="'priority-' + (solicitudDetalle()!.prioridad || 'media').toLowerCase()">priority_high</mat-icon>
                    <h4>Prioridad</h4>
                    <mat-chip [class]="'chip-prioridad-' + (solicitudDetalle()!.prioridad || 'media').toLowerCase()">
                      {{ solicitudDetalle()!.prioridad || 'Sin asignar' }}
                    </mat-chip>
                  </mat-card>
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </mat-card>
      }

      @if (!loading() && !solicitudDetalle() && searched()) {
        <div class="empty-state">
          <mat-icon>search_off</mat-icon>
          <p>No se encontró información enriquecida para la solicitud indicada.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 900px; margin: 0 auto; }
    .page-title { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; color: #333; }
    .title-icon { font-size: 28px; width: 28px; height: 28px; }
    .page-subtitle { color: #666; margin-bottom: 24px; font-size: 14px; }
    .selector-card { margin-bottom: 24px; }
    .search-form { display: flex; align-items: center; gap: 16px; }
    .search-form mat-form-field { flex: 1; max-width: 300px; }
    .loading-container { display: flex; justify-content: center; padding: 48px; }
    .detalle-card { margin-bottom: 24px; }
    .tab-icon { margin-right: 8px; }
    .tab-content { padding: 24px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .info-item { display: flex; flex-direction: column; gap: 4px; }
    .info-item.full-width { grid-column: 1 / -1; }
    .label { font-size: 12px; text-transform: uppercase; color: #888; font-weight: 600; }
    .value { font-size: 15px; color: #333; }
    .ia-section { margin-bottom: 24px; }
    .ia-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .ia-header h3 { margin: 0; color: #1a237e; }
    .ia-icon { color: #ff9800; }
    .ia-resumen { background: #f5f5f5; border-left: 4px solid #1a237e; padding: 16px 20px; border-radius: 0 8px 8px 0; }
    .ia-resumen p { margin: 0; line-height: 1.6; color: #444; }
    .ia-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .ia-detail-card { text-align: center; padding: 24px; display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .ia-detail-card h4 { margin: 0; color: #666; }
    .detail-icon { font-size: 32px; width: 32px; height: 32px; }
    .priority-alta { color: #f44336 !important; }
    .priority-media { color: #ff9800 !important; }
    .priority-baja { color: #4caf50 !important; }
    .chip-prioridad-alta { background-color: #ffebee !important; color: #c62828 !important; }
    .chip-prioridad-media { background-color: #fff3e0 !important; color: #e65100 !important; }
    .chip-prioridad-baja { background-color: #e8f5e9 !important; color: #2e7d32 !important; }
    .empty-state { text-align: center; padding: 48px 24px; background: #f9f9f9; border-radius: 8px; color: #666; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; color: #ccc; margin-bottom: 16px; }
  `]
})
export class ConsultarInfoIaComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastNotificationService);

  loading = signal<boolean>(false);
  searched = signal<boolean>(false);
  solicitudDetalle = signal<SolicitudIA | null>(null);

  filterForm = this.fb.group({
    solicitudId: [null as number | null]
  });

  ngOnInit() {}

  buscarSolicitud() {
    const id = this.filterForm.value.solicitudId;
    if (!id) {
      this.toast.warning('Ingrese un ID de solicitud');
      return;
    }

    this.loading.set(true);
    this.searched.set(true);
    this.solicitudDetalle.set(null);

    this.api.get<SolicitudIA>(`solicitudes/${id}/info-enriquecida`).subscribe({
      next: (res) => {
        this.solicitudDetalle.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Error al consultar información enriquecida');
        this.loading.set(false);
      }
    });
  }
}
