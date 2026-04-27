import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-sales-chart',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  template: `
    <div class="chart-container">
      <h3>Resumen de Actividad</h3>
      
      @defer (on viewport) {
        <div class="chart-wrapper">
          <ngx-charts-bar-vertical
            [results]="data"
            [xAxis]="true"
            [yAxis]="true"
            [legend]="false"
            [showXAxisLabel]="true"
            [showYAxisLabel]="true"
            xAxisLabel="Período"
            yAxisLabel="Cantidad"
            [animations]="true"
            [gradient]="true"
            [scheme]="colorScheme"
            [barPadding]="20">
          </ngx-charts-bar-vertical>
        </div>
      } @placeholder {
        <div class="placeholder-skeleton mat-elevation-z1">
          Cargando gráfico...
        </div>
      }
    </div>
  `,
  styles: [`
    .chart-container {
      background: var(--sys-surface);
      border-radius: 12px;
      padding: 16px;
      padding-bottom: 24px;
      height: 100%;
      min-height: 350px;
      box-shadow: 0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12); /* mat-elevation-z4 equivalent */
    }

    h3 {
      font-size: 1.25rem;
      font-weight: 500;
      margin-bottom: 16px;
      color: var(--sys-on-surface);
    }

    .chart-wrapper {
      height: 300px;
      width: 100%;
    }

    .placeholder-skeleton {
      height: 300px;
      width: 100%;
      background-color: var(--sys-surface-container-highest);
      border-radius: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: var(--sys-on-surface-variant);
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 0.3; }
      100% { opacity: 0.6; }
    }
  `]
})
export class SalesChartComponent {
  @Input() data: { name: string, value: number }[] = [];

  // Color scheme por defecto minimalista (material compatible)
  colorScheme: any = {
    domain: ['#6200ea', '#03dac6', '#018786', '#b00020']
  };
}
