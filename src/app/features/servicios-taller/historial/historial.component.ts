import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ApiService } from '../../../core/services/api.service';
import { ToastNotificationService } from '../../../shared/components/toast-notification/toast-notification.service';
import { Solicitud } from '../../../core/models';

@Component({
  selector: 'app-historial-servicios',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DatePipe,
    CurrencyPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-container">
      <h2 class="page-title">Historial de Servicios</h2>
      
      <mat-card class="filters-card">
        <mat-card-content>
          <form [formGroup]="filtersForm" (ngSubmit)="loadHistorial()" class="filters-form">
            <mat-form-field appearance="outline">
              <mat-label>Fecha Inicio</mat-label>
              <input matInput type="date" formControlName="fechaInicio" />
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Fecha Fin</mat-label>
              <input matInput type="date" formControlName="fechaFin" />
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Estado</mat-label>
              <mat-select formControlName="estado">
                <mat-option value="">Todos</mat-option>
                <mat-option value="Finalizado">Finalizado</mat-option>
                <mat-option value="Rechazado">Rechazado</mat-option>
              </mat-select>
            </mat-form-field>
            
            <div class="actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="loading()">
                Filtrar
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
      
      <mat-card>
        <mat-card-content>
          @if (loading()) {
            <div class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
          } @else {
            <mat-table [dataSource]="solicitudes()" class="mat-elevation-z0">
              <!-- Fecha Column -->
              <ng-container matColumnDef="fecha">
                <mat-header-cell *matHeaderCellDef> Fecha </mat-header-cell>
                <mat-cell *matCellDef="let element"> {{ element.fecha_reporte | date:'shortDate' }} </mat-cell>
              </ng-container>

              <!-- Cliente Column -->
              <ng-container matColumnDef="cliente">
                <mat-header-cell *matHeaderCellDef> Cliente </mat-header-cell>
                <mat-cell *matCellDef="let element"> 
                  {{ element.cliente?.nombre || 'N/A' }} <br>
                  <small>{{ element.cliente?.telefono }}</small>
                </mat-cell>
              </ng-container>

              <!-- Vehículo Column -->
              <ng-container matColumnDef="vehiculo">
                <mat-header-cell *matHeaderCellDef> Vehículo </mat-header-cell>
                <mat-cell *matCellDef="let element"> 
                  {{ element.vehiculo?.marca }} {{ element.vehiculo?.modelo }} <br>
                  <small>{{ element.vehiculo?.placa }}</small>
                </mat-cell>
              </ng-container>
              
              <!-- Estado Column -->
              <ng-container matColumnDef="estado">
                <mat-header-cell *matHeaderCellDef> Estado </mat-header-cell>
                <mat-cell *matCellDef="let element"> {{ element.estado }} </mat-cell>
              </ng-container>

              <!-- Monto Column (opcional, simulado si no viene en Solicitud) -->
              <ng-container matColumnDef="monto">
                <mat-header-cell *matHeaderCellDef> Monto </mat-header-cell>
                <mat-cell *matCellDef="let element"> {{ getMontoEstimado(element) | currency:'USD' }} </mat-cell>
              </ng-container>

              <!-- Acciones Column -->
              <ng-container matColumnDef="acciones">
                <mat-header-cell *matHeaderCellDef> Acciones </mat-header-cell>
                <mat-cell *matCellDef="let element">
                  <button mat-icon-button color="primary" (click)="descargarComprobante(element.id)" title="Ver Comprobante">
                    <mat-icon>picture_as_pdf</mat-icon>
                  </button>
                </mat-cell>
              </ng-container>

              <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
              <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
              
              <!-- Fila sin datos -->
              <tr class="mat-row empty-row" *matNoDataRow>
                <td class="mat-cell" colspan="6">
                  No se encontraron servicios finalizados que coincidan con los filtros.
                </td>
              </tr>
            </mat-table>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .page-title {
      margin-bottom: 24px;
      color: #333;
    }
    
    .filters-card {
      margin-bottom: 24px;
      
      .filters-form {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        align-items: center;
        
        mat-form-field {
          flex: 1;
          min-width: 200px;
        }
        
        .actions {
          display: flex;
          align-items: center;
          height: 100%;
          padding-bottom: 16px;
        }
      }
    }
    
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }
    
    .empty-row {
      text-align: center;
      padding: 24px;
      color: #666;
    }
    
    mat-cell {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
    }
  `]
})
export class HistorialComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastNotificationService);

  solicitudes = signal<Solicitud[]>([]);
  loading = signal<boolean>(false);

  displayedColumns: string[] = ['fecha', 'cliente', 'vehiculo', 'estado', 'monto', 'acciones'];

  filtersForm = this.fb.group({
    fechaInicio: [''],
    fechaFin: [''],
    estado: ['Finalizado']
  });

  ngOnInit() {
    this.loadHistorial();
  }

  loadHistorial() {
    this.loading.set(true);
    const formVals = this.filtersForm.value;
    
    const params = new URLSearchParams();
    if (formVals.fechaInicio) params.append('fecha_inicio', formVals.fechaInicio);
    if (formVals.fechaFin) params.append('fecha_fin', formVals.fechaFin);
    if (formVals.estado) params.append('estado', formVals.estado);
    
    const query = params.toString() ? '?' + params.toString() : '';

    this.api.get<Solicitud[]>('solicitudes/mis-solicitudes' + query).subscribe({
      next: (res) => {
        this.solicitudes.set(res || []);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Error al cargar el historial');
        this.loading.set(false);
      }
    });
  }

  getMontoEstimado(solicitud: Solicitud): number {
    // Placeholder para el monto, se asume que si está finalizado hay un monto o viene de Pago
    return (solicitud.id * 15) + 50; 
  }

  descargarComprobante(solicitudId: number) {
    this.toast.info('Descargando comprobante PDF para la solicitud #' + solicitudId);
    // En una implementación real: 
    // window.open(`${environment.apiUrl}/solicitudes/${solicitudId}/pdf`, '_blank');
  }
}
