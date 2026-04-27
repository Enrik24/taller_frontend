import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-ia-analysis',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="placeholder-ia">
      <mat-icon class="ia-icon">psychology</mat-icon>
      <h3>Análisis con IA</h3>
      <p class="status-badge">En desarrollo</p>
      <p class="description">Próximamente: Análisis automático de evidencias con modelos de Computer Vision y procesamiento de lenguaje (NLP).</p>
      <button mat-button disabled class="action-btn">
        Procesar Evidencias
      </button>
    </div>
  `,
  styles: [`
    .placeholder-ia {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px 16px;
      text-align: center;
      background-color: #f5f5f5;
      border-radius: 12px;
      border: 1px dashed #ccc;
      margin-top: 16px;
    }
    
    .ia-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #3f51b5;
      margin-bottom: 16px;
    }
    
    h3 {
      margin: 0 0 8px 0;
      color: #333;
    }
    
    .status-badge {
      display: inline-block;
      background-color: #e0e0e0;
      color: #555;
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 16px;
      margin-bottom: 16px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .description {
      color: #666;
      max-width: 400px;
      margin-bottom: 24px;
      line-height: 1.5;
    }
    
    .action-btn {
      background-color: #e0e0e0;
    }
  `]
})
export class IaAnalysisComponent {
  @Input({ required: true }) solicitudId!: number;
}
