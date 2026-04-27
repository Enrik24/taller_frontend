import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stats-cards',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="stats-grid">
      @for (stat of statItems(); track stat.title) {
        <mat-card class="stat-card" [class]="stat.colorClass">
          <mat-card-header>
            <div mat-card-avatar class="icon-container">
              <mat-icon>{{ stat.icon }}</mat-icon>
            </div>
            <mat-card-title>{{ stat.title }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="value">{{ stat.value }}</div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      
      &:hover {
        transform: translateY(-4px);
        @apply mat-elevation-z4;
      }
    }

    mat-card-header {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
    }

    .icon-container {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(0,0,0,0.05);
      margin-right: 16px;
    }

    mat-card-title {
      font-size: 1rem;
      font-weight: 500;
      color: var(--sys-on-surface-variant);
    }

    .value {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--sys-on-surface);
    }

    /* Opcionales variaciones de color si es necesario */
    .color-primary { border-top: 4px solid var(--sys-primary); }
    .color-accent { border-top: 4px solid var(--sys-tertiary); }
    .color-success { border-top: 4px solid #4caf50; }
    .color-warning { border-top: 4px solid #ff9800; }
  `]
})
export class StatsCardsComponent {
  @Input() stats: { solicitudes: number, talleres: number, clientes: number, comisiones: number } = {
    solicitudes: 0, talleres: 0, clientes: 0, comisiones: 0
  };

  statItems = computed(() => [
    { title: 'Solicitudes Hoy', value: this.stats.solicitudes, icon: 'build', colorClass: 'color-primary' },
    { title: 'Talleres Activos', value: this.stats.talleres, icon: 'storefront', colorClass: 'color-accent' },
    { title: 'Nuevos Clientes', value: this.stats.clientes, icon: 'people', colorClass: 'color-success' },
    { title: 'Comisiones (Bs)', value: this.stats.comisiones, icon: 'account_balance_wallet', colorClass: 'color-warning' }
  ]);
}
