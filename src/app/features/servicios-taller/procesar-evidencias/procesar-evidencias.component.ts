import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-procesar-evidencias',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div class="page-container">
      <h1>Procesar Evidencias con IA</h1>
      <p>Análisis automatizado de fotos de colisiones usando Computer Vision Gemini.</p>
      
      <mat-card class="elevation-z0" style="border: 1px solid #eee; margin-top: 16px;">
        <mat-card-header>
          <mat-icon mat-card-avatar style="color: #6c63ff;">psychology</mat-icon>
          <mat-card-title>Análisis IA Pendiente</mat-card-title>
          <mat-card-subtitle>Se detectaron 3 imágenes en la solicitud #1024</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content style="padding: 16px;">
          <div style="background: #f8f9fa; padding: 24px; text-align: center; border-radius: 8px; border: 1px dashed #ccc;">
            <mat-icon style="font-size: 48px; width: 48px; height: 48px; color: #a1a1aa;">image_search</mat-icon>
            <p>Sube imágenes para pre-diagnosticar daños en carrocería o posibles piezas necesarias.</p>
            <button mat-flat-button color="primary">Ejecutar Análisis</button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class ProcesarEvidenciasComponent {}
