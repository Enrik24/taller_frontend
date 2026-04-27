import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

import { ApiService } from '../../../core/services/api.service';
import { ToastNotificationService } from '../../../shared/components/toast-notification/toast-notification.service';

interface CandidatoTaller {
  id: number;
  nombre: string;
  distancia_km: number;
  calificacion: number;
  disponible: boolean;
  especialidad: string;
}

@Component({
  selector: 'app-asignacion-inteligente',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-container">
      <h2 class="page-title">
        <mat-icon class="title-icon">ads_click</mat-icon>
        Asignar Taller Inteligentemente
      </h2>
      <p class="page-subtitle">Ejecute la asignación automática basada en distancia, disponibilidad y calificación.</p>

      <mat-card class="action-card">
        <mat-card-content>
          <div class="action-section">
            <div class="action-info">
              <mat-icon class="action-icon" color="primary">auto_fix_high</mat-icon>
              <div>
                <h3>Asignación Inteligente</h3>
                <p>El sistema selecciona automáticamente el mejor taller disponible considerando distancia, calificación y especialidad.</p>
              </div>
            </div>
            <button mat-raised-button color="primary" (click)="ejecutarAsignacion()" [disabled]="loading()">
              <mat-icon>play_arrow</mat-icon>
              Ejecutar asignación
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      @if (loading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Procesando asignación inteligente...</p>
        </div>
      }

      @if (candidatos().length > 0) {
        <mat-card class="results-card">
          <mat-card-header>
            <mat-icon mat-card-avatar color="primary">format_list_numbered</mat-icon>
            <mat-card-title>Candidatos Encontrados</mat-card-title>
            <mat-card-subtitle>Ordenados por mejor puntuación</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <mat-list>
              @for (candidato of candidatos(); track candidato.id; let i = $index) {
                <mat-list-item class="candidato-item">
                  <div class="candidato-rank" matListItemIcon>
                    <span class="rank-badge" [class.rank-1]="i === 0" [class.rank-2]="i === 1" [class.rank-3]="i === 2">
                      {{ i + 1 }}
                    </span>
                  </div>
                  <div matListItemTitle class="candidato-nombre">
                    {{ candidato.nombre }}
                  </div>
                  <div matListItemLine class="candidato-details">
                    <mat-chip class="detail-chip">
                      <mat-icon>place</mat-icon> {{ candidato.distancia_km }} km
                    </mat-chip>
                    <mat-chip class="detail-chip">
                      <mat-icon>star</mat-icon> {{ candidato.calificacion }}/5
                    </mat-chip>
                    <mat-chip class="detail-chip">
                      <mat-icon>build</mat-icon> {{ candidato.especialidad }}
                    </mat-chip>
                    <mat-chip [class]="candidato.disponible ? 'chip-disponible' : 'chip-no-disponible'">
                      {{ candidato.disponible ? 'Disponible' : 'No disponible' }}
                    </mat-chip>
                  </div>
                </mat-list-item>
                @if (i < candidatos().length - 1) {
                  <mat-divider></mat-divider>
                }
              }
            </mat-list>
          </mat-card-content>
        </mat-card>
      }

      @if (executed() && candidatos().length === 0 && !loading()) {
        <div class="empty-state">
          <mat-icon>location_off</mat-icon>
          <p>No se encontraron talleres candidatos para la asignación.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 900px; margin: 0 auto; }
    .page-title { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; color: #333; }
    .title-icon { font-size: 28px; width: 28px; height: 28px; }
    .page-subtitle { color: #666; margin-bottom: 24px; font-size: 14px; }
    .action-card { margin-bottom: 24px; }
    .action-section { display: flex; justify-content: space-between; align-items: center; gap: 24px; flex-wrap: wrap; }
    .action-info { display: flex; align-items: flex-start; gap: 16px; flex: 1; }
    .action-info h3 { margin: 0 0 4px; color: #333; }
    .action-info p { margin: 0; color: #666; font-size: 14px; }
    .action-icon { font-size: 36px; width: 36px; height: 36px; }
    .loading-container { display: flex; flex-direction: column; align-items: center; padding: 48px; gap: 16px; color: #666; }
    .results-card { margin-bottom: 24px; }
    .candidato-item { min-height: 72px !important; }
    .candidato-nombre { font-weight: 600; }
    .candidato-details { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px; }
    .detail-chip { font-size: 12px; }
    .detail-chip mat-icon { font-size: 14px; width: 14px; height: 14px; margin-right: 4px; }
    .rank-badge { 
      display: flex; align-items: center; justify-content: center; 
      width: 28px; height: 28px; border-radius: 50%; 
      background: #e0e0e0; font-weight: 700; font-size: 14px; color: #666;
    }
    .rank-1 { background: #ffd700; color: #333; }
    .rank-2 { background: #c0c0c0; color: #333; }
    .rank-3 { background: #cd7f32; color: white; }
    .chip-disponible { background-color: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-no-disponible { background-color: #ffebee !important; color: #c62828 !important; }
    .empty-state { text-align: center; padding: 48px 24px; background: #f9f9f9; border-radius: 8px; color: #666; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; color: #ccc; margin-bottom: 16px; }
  `]
})
export class AsignacionInteligenteComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastNotificationService);

  candidatos = signal<CandidatoTaller[]>([]);
  loading = signal<boolean>(false);
  executed = signal<boolean>(false);

  ngOnInit() {}

  ejecutarAsignacion() {
    this.loading.set(true);
    this.executed.set(true);
    this.candidatos.set([]);

    this.api.post<CandidatoTaller[]>('asignacion/inteligente', {}).subscribe({
      next: (res) => {
        this.candidatos.set(res || []);
        if ((res || []).length > 0) {
          this.toast.success('Asignación ejecutada. Se encontraron ' + res.length + ' candidatos.');
        }
        this.loading.set(false);
      },
      error: () => {
        // Use dummy data as placeholder
        this.candidatos.set([
          { id: 1, nombre: 'Taller Central - Av. Principal', distancia_km: 2.3, calificacion: 4.8, disponible: true, especialidad: 'Mecánica General' },
          { id: 2, nombre: 'AutoFix Express', distancia_km: 4.1, calificacion: 4.5, disponible: true, especialidad: 'Eléctrico' },
          { id: 3, nombre: 'Taller Rápido Norte', distancia_km: 5.7, calificacion: 4.2, disponible: true, especialidad: 'Mecánica General' },
          { id: 4, nombre: 'MecánicaPro Sur', distancia_km: 8.0, calificacion: 4.0, disponible: false, especialidad: 'Neumáticos' },
          { id: 5, nombre: 'Taller El Ingeniero', distancia_km: 10.2, calificacion: 3.9, disponible: true, especialidad: 'Chasis y Carrocería' },
        ]);
        this.toast.info('Mostrando candidatos de demostración');
        this.loading.set(false);
      }
    });
  }
}
