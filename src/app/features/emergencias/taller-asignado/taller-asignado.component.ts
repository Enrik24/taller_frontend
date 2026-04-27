import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-taller-asignado',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="page-container">
      <h1>Taller Asignado y Tiempo Estimado</h1>
      <p>Información del técnico en camino hacia tu ubicación.</p>
      
      <mat-card class="elevation-z0" style="border: 1px solid #10b981; margin-top: 16px;">
        <mat-card-header>
          <mat-icon mat-card-avatar style="color: #10b981;">home_repair_service</mat-icon>
          <mat-card-title>Grua y Taller Express</mat-card-title>
          <mat-card-subtitle>Estado: En Camino</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content style="padding: 16px;">
          <h3>🚗 Tiempo Estimado de Llegada: <strong>14 min</strong></h3>
          <p>Técnico: Carlos Mendoza (Matrícula: WXY-999)</p>
          <div style="height: 200px; background: #e5e7eb; display: flex; align-items: center; justify-content: center; margin-top: 16px; border-radius: 8px;">
            <span style="color: #6b7280;">[ Mapa de Seguimiento Leaflet ]</span>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class TallerAsignadoComponent {}
