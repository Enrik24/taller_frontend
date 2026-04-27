import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Solicitud } from '../../../../core/models';

@Component({
  selector: 'app-solicitud-card',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatChipsModule,
    DatePipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card class="solicitud-card">
      <mat-card-header>
        <mat-card-title>Solicitud #{{ solicitud.id }}</mat-card-title>
        <mat-card-subtitle>
          {{ solicitud.fecha_reporte | date:'medium' }} • Distancia: 2.5 km
        </mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <div class="info-section">
          <div class="info-item">
            <strong>Cliente:</strong> {{ solicitud.cliente?.nombre || 'Desconocido' }} 
            (Tel: {{ solicitud.cliente?.telefono || 'N/A' }})
          </div>
          
          <div class="info-item mt-2" *ngIf="solicitud.vehiculo">
            <strong>Vehículo:</strong> {{ solicitud.vehiculo.marca }} {{ solicitud.vehiculo.modelo }} 
            ({{ solicitud.vehiculo.anio }}) - {{ solicitud.vehiculo.placa }}
          </div>
          
          <div class="info-item mt-2">
            <strong>Problema:</strong> {{ solicitud.tipo_problema || 'No especificado' }}
            <mat-chip-set class="prioridad-chip" style="display: inline-block; margin-left: 8px; vertical-align: middle;">
              <mat-chip [ngClass]="getPrioridadClass(solicitud.prioridad)">
                {{ solicitud.prioridad || 'Normal' }}
              </mat-chip>
            </mat-chip-set>
          </div>
          
          <div class="info-item descripcion mt-2">
            <strong>Descripción:</strong> 
            {{ (solicitud.descripcion_texto || '') | slice:0:100 }}{{ (solicitud.descripcion_texto?.length || 0) > 100 ? '...' : '' }}
          </div>
          
          <!-- Si quisieramos mostrar lat/lng -->
          <div class="info-item text-muted mt-2" *ngIf="solicitud.latitud && solicitud.longitud">
            <small>Ubicación: {{ solicitud.latitud | number:'1.4-4' }}, {{ solicitud.longitud | number:'1.4-4' }}</small>
          </div>
        </div>
      </mat-card-content>
      
      <mat-card-actions align="end">
        <button mat-button (click)="viewDetail.emit(solicitud.id)">
          <mat-icon>visibility</mat-icon> Ver Detalle
        </button>
        <span class="spacer"></span>
        <button mat-button color="warn" (click)="reject.emit(solicitud.id)">
          <mat-icon>close</mat-icon> Rechazar
        </button>
        <button mat-raised-button color="primary" (click)="accept.emit(solicitud.id)">
          <mat-icon>check</mat-icon> Aceptar
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .solicitud-card {
      margin-bottom: 16px;
      transition: box-shadow 0.3s ease;
      
      &:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
    }
    
    .info-section {
      margin-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .info-item {
      font-size: 14px;
    }
    
    .descripcion {
      font-style: italic;
      color: #666;
    }
    
    .text-muted {
      color: #999;
    }
    
    .spacer {
      flex: 1 1 auto;
    }
    
    .prioridad-alta {
      background-color: #f44336 !important;
      color: white !important;
    }
    .prioridad-media {
      background-color: #ff9800 !important;
      color: white !important;
    }
    .prioridad-baja {
      background-color: #4caf50 !important;
      color: white !important;
    }
  `]
})
export class SolicitudCardComponent {
  @Input({ required: true }) solicitud!: Solicitud;
  
  @Output() accept = new EventEmitter<number>();
  @Output() reject = new EventEmitter<number>();
  @Output() viewDetail = new EventEmitter<number>();
  
  getPrioridadClass(prioridad?: string): string {
    const p = (prioridad || '').toLowerCase();
    if (p.includes('alta') || p.includes('urgente')) return 'prioridad-alta';
    if (p.includes('media')) return 'prioridad-media';
    return 'prioridad-baja';
  }
}
