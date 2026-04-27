import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';

// Utilizaremos una interfaz genérica aquí para poder reusarla
export interface Actividad {
  id: string | number;
  tipo: string;
  descripcion: string;
  fecha: Date | string;
  icon?: string;
}

@Component({
  selector: 'app-recent-activity',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule, MatDividerModule, MatCardModule],
  template: `
    <mat-card class="activity-card">
      <mat-card-header>
        <mat-card-title>Actividad Reciente</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <mat-list>
          @for (actividad of actividades.slice(0, 5); track actividad.id; let last = $last) {
            <mat-list-item>
              <mat-icon matListItemIcon [class]="actividad.tipo">{{ actividad.icon || 'history' }}</mat-icon>
              <div matListItemTitle>{{ actividad.descripcion }}</div>
              <div matListItemLine class="timestamp">{{ getRelativeTime(actividad.fecha) }}</div>
            </mat-list-item>
            @if (!last) {
              <mat-divider></mat-divider>
            }
          } @empty {
            <div class="empty-state">
              No hay actividad reciente.
            </div>
          }
        </mat-list>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .activity-card {
      height: 100%;
      border-radius: 12px;
      box-shadow: 0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12); /* mat-elevation-z4 equivalent */
    }

    mat-card-header {
      margin-bottom: 8px;
      padding-top: 16px;
    }

    mat-card-title {
      font-size: 1.25rem;
      font-weight: 500;
    }

    mat-list-item {
      padding: 8px 0;
    }

    .timestamp {
      font-size: 0.85rem;
      color: var(--sys-on-surface-variant);
    }

    .empty-state {
      padding: 24px;
      text-align: center;
      color: var(--sys-on-surface-variant);
      font-style: italic;
    }
    
    mat-icon.CREAR { color: #4caf50; }
    mat-icon.ACTUALIZAR { color: #2196f3; }
    mat-icon.ELIMINAR { color: #f44336; }
    mat-icon.SOLICITUD { color: #ff9800; }
  `]
})
export class RecentActivityComponent {
  @Input() actividades: Actividad[] = [];

  getRelativeTime(dateString: Date | string): string {
    const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    
    // Calcula la diferencia en horas
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    
    if (Math.abs(diffHours) < 24) {
      if (diffHours === 0) {
          const diffMins = Math.round(diffMs / (1000 * 60));
          return rtf.format(diffMins, 'minute');
      }
      return rtf.format(diffHours, 'hour');
    }
    
    const diffDays = Math.round(diffHours / 24);
    return rtf.format(diffDays, 'day');
  }
}
