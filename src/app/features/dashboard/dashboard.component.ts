import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { StatsCardsComponent } from './components/stats-cards/stats-cards.component';
import { SalesChartComponent } from './components/sales-chart/sales-chart.component';
import { RecentActivityComponent, Actividad } from './components/recent-activity/recent-activity.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    StatsCardsComponent, 
    SalesChartComponent, 
    RecentActivityComponent,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="dashboard-container">
      <div class="header-section">
        <h1 class="page-title">Dashboard Principal</h1>
        <p class="subtitle">Bienvenido de nuevo, {{ userName() }}</p>
      </div>

      <div *ngIf="loading()" class="loading-state">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Cargando información en tiempo real...</p>
      </div>

      <ng-container *ngIf="!loading()">
        <!-- Primera Fila: Stats Cards -->
        <app-stats-cards [stats]="stats()"></app-stats-cards>

        <!-- Segunda Fila: Gráficos y Actividad -->
        <div class="charts-activity-grid">
          <div class="chart-section">
            <app-sales-chart [data]="chartData()"></app-sales-chart>
          </div>
          <div class="activity-section">
            <app-recent-activity [actividades]="activity()"></app-recent-activity>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
      min-height: calc(100vh - 64px);
    }

    .header-section {
      margin-bottom: 32px;
    }

    .page-title {
      font-size: 2rem;
      font-weight: 700;
      color: var(--sys-on-surface);
      margin: 0 0 8px 0;
    }

    .subtitle {
      font-size: 1rem;
      color: var(--sys-on-surface-variant);
      margin: 0;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      gap: 16px;
      color: #666;
    }

    .charts-activity-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
      margin-top: 24px;
    }

    @media (max-width: 960px) {
      .charts-activity-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  // Signals para el estado
  userName = signal<string>('Usuario');
  loading = signal<boolean>(false);
  
  stats = signal({ solicitudes: 0, talleres: 0, clientes: 0, comisiones: 0 });
  
  chartData = signal<{ name: string, value: number }[]>([]);
  
  activity = signal<Actividad[]>([]);

  ngOnInit() {
    // Configurar nombre
    const user = this.authService.getCurrentUser();
    if (user?.nombre) {
        this.userName.set(user.nombre);
    }

    this.cargarDatosDashboard();
  }

  private cargarDatosDashboard() {
    this.loading.set(true);
    const user = this.authService.getCurrentUser();
    const isAdministrador = user?.roles?.[0]?.nombre?.toLowerCase() === 'administrador' || user?.roles?.[0]?.nombre?.toLowerCase() === 'admin';
    
    const endpoint = isAdministrador ? 'admin/dashboard-stats' : 'solicitudes/resumen';
    
    this.apiService.get<any>(endpoint).subscribe({
      next: (res) => {
        // Adaptación flexible de la respuesta del backend
        const data = res.data || res;
        
        if (data.stats) {
          this.stats.set({
            solicitudes: data.stats.solicitudes || data.stats.total_solicitudes || 0,
            talleres: data.stats.talleres || data.stats.total_talleres || 0,
            clientes: data.stats.clientes || data.stats.total_clientes || 0,
            comisiones: data.stats.comisiones || data.stats.total_comisiones || 0
          });
        }

        if (data.chart) {
          this.chartData.set(data.chart);
        }

        if (data.activities || data.recent_activity) {
          this.activity.set(data.activities || data.recent_activity);
        }
        
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar dashboard:', err);
        // Fallback or empty state
        this.loading.set(false);
      }
    });
  }
}
