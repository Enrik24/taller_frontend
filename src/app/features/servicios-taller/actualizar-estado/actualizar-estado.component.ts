import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-actualizar-estado',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatStepperModule, MatButtonModule],
  template: `
    <div class="page-container">
      <h1>Actualizar Estado del Servicio</h1>
      <p>Supervisión en tiempo real del progreso de la emergencia.</p>

      <mat-card class="elevation-z0" style="border: 1px solid #eee; margin-top: 16px;">
        <mat-card-content>
          <mat-stepper orientation="vertical" #stepper>
            <mat-step label="En Camino">
              <p>El técnico fue despachado.</p>
              <button mat-flat-button color="primary" matStepperNext>Marcar como Llegado</button>
            </mat-step>
            <mat-step label="En Sitio / Evaluación">
              <p>Evaluación preliminar del vehículo en progreso.</p>
              <button mat-button matStepperPrevious>Atrás</button>
              <button mat-flat-button color="primary" matStepperNext>Iniciar Reparación</button>
            </mat-step>
            <mat-step label="Reparando">
              <p>Reparación física y reemplazo de piezas.</p>
              <button mat-button matStepperPrevious>Atrás</button>
              <button mat-flat-button color="primary" matStepperNext>Finalizar</button>
            </mat-step>
            <mat-step label="Finalizado">
              <p>El servicio ha concluido exitosamente.</p>
              <button mat-flat-button color="accent" (click)="stepper.reset()">Reiniciar Flujo</button>
            </mat-step>
          </mat-stepper>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class ActualizarEstadoComponent {}
