import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Solicitud } from '../../../../core/models';

@Component({
  selector: 'app-solicitud-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule, MatButtonModule, MatIconModule],
  template: `
    <mat-card class="mb-4 hover:shadow-lg transition-shadow duration-300 w-full max-w-3xl">
      <mat-card-header class="pb-2 relative flex flex-col items-start w-full">
        <mat-card-title class="text-xl font-bold flex items-center justify-between w-full pr-12">
          <span>Solicitud #{{ solicitud.id }}</span>
          
          <div class="flex gap-2 mb-2 sm:mb-0 ml-auto mr-4">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" [ngClass]="getPrioridadClass()">
              {{ solicitud.prioridad || 'Media' }}
            </span>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" [ngClass]="getEstadoClass()">
              {{ solicitud.estado }}
            </span>
          </div>
        </mat-card-title>
        <mat-card-subtitle class="mt-1">{{ solicitud.fecha_reporte | date:'dd/MM/yyyy HH:mm' }}</mat-card-subtitle>
      </mat-card-header>

      <mat-card-content class="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p class="mb-2 flex items-center text-gray-700">
            <mat-icon class="mr-2 text-gray-500 scale-90">directions_car</mat-icon>
            <span class="font-semibold mr-1">Vehículo:</span> 
            {{ solicitud.vehiculo?.marca }} {{ solicitud.vehiculo?.modelo }} ({{ solicitud.vehiculo?.placa }})
          </p>
          <p class="mb-2 flex items-center text-gray-700">
            <mat-icon class="mr-2 text-gray-500 scale-90">build</mat-icon>
            <span class="font-semibold mr-1">Problema:</span> 
            {{ solicitud.tipo_problema || 'No especificado' }}
          </p>
        </div>
        <div>
          @if (solicitud.latitud && solicitud.longitud) {
            <p class="mb-2 flex items-center text-gray-700">
              <mat-icon class="mr-2 text-gray-500 scale-90">location_on</mat-icon>
              <span class="font-semibold mr-1">Ubicación:</span> 
              Lat: {{ solicitud.latitud | number:'1.4-4' }}, Lng: {{ solicitud.longitud | number:'1.4-4' }}
            </p>
          }
          @if(solicitud.taller) {
            <p class="mb-2 flex items-center text-gray-700">
              <mat-icon class="mr-2 text-gray-500 scale-90">store</mat-icon>
              <span class="font-semibold mr-1">Taller:</span> 
              {{ solicitud.taller.nombre_comercial }}
            </p>
          }
        </div>
      </mat-card-content>

      <mat-card-actions class="flex justify-end pr-4 pb-4">
        <button mat-raised-button color="primary" (click)="onVerDetalle()">Ver Detalle</button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    mat-card {
      border-radius: 12px;
      overflow: hidden;
    }
  `]
})
export class SolicitudCardComponent {
  @Input() solicitud!: Solicitud;
  @Output() verDetalle = new EventEmitter<number>();

  getPrioridadClass(): string {
    const p = this.solicitud?.prioridad?.toLowerCase();
    if (p === 'alta') return 'bg-red-100 text-red-800 border border-red-200';
    if (p === 'media') return 'bg-orange-100 text-orange-800 border border-orange-200';
    return 'bg-blue-100 text-blue-800 border border-blue-200';
  }

  getEstadoClass(): string {
    const e = this.solicitud?.estado?.toLowerCase();
    if (e === 'pendiente') return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    if (e === 'en proceso') return 'bg-blue-100 text-blue-800 border border-blue-200';
    return 'bg-green-100 text-green-800 border border-green-200';
  }

  onVerDetalle() {
    if (this.solicitud?.id) {
      this.verDetalle.emit(this.solicitud.id);
    }
  }
}
