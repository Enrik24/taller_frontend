import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gestion-disponibilidad',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatSlideToggleModule, FormsModule],
  template: `
    <div class="page-container">
      <h1>Gestionar Disponibilidad</h1>
      <p>Activa o desactiva la recepción de nuevas emergencias de manera global o por técnico.</p>
      
      <mat-card class="elevation-z0" style="border: 1px solid #eee; margin-top: 16px;">
        <mat-card-content style="padding: 24px;">
          <mat-slide-toggle [(ngModel)]="dispGlobal" color="primary">
            <strong>Disponibilidad Global del Taller</strong>: {{ dispGlobal ? 'ACEPTANDO SOLICITUDES' : 'OCUPADO' }}
          </mat-slide-toggle>
          
          <div style="margin-top: 32px;">
            <h3>Técnicos</h3>
            <div style="display: flex; justify-content: space-between; padding: 12px; border-bottom: 1px solid #eee;">
              <span>Juan Pérez (Mecánica rápida)</span>
              <mat-slide-toggle checked="true"></mat-slide-toggle>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 12px;">
              <span>María López (Electricista)</span>
              <mat-slide-toggle></mat-slide-toggle>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class GestionDisponibilidadComponent {
  dispGlobal = true;
}
