import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ApiService } from '../../../core/services/api.service';
import { ToastNotificationService } from '../../../shared/components/toast-notification/toast-notification.service';
import { SolicitudCardComponent } from '../components/solicitud-card/solicitud-card.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Solicitud } from '../../../core/models';

@Component({
  selector: 'app-solicitudes-disponibles',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    SolicitudCardComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-container">
      <h2 class="page-title">Solicitudes Disponibles</h2>
      
      <mat-card class="filters-card">
        <mat-card-content>
          <form [formGroup]="filtersForm" (ngSubmit)="loadSolicitudes()" class="filters-form">
            <mat-form-field appearance="outline">
              <mat-label>Distancia máxima (km)</mat-label>
              <input matInput type="number" formControlName="distanciaMax" placeholder="Ej. 10" />
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Tipo de Problema</mat-label>
              <mat-select formControlName="tipoProblema">
                <mat-option value="">Todos</mat-option>
                <mat-option value="Mecánico">Mecánico</mat-option>
                <mat-option value="Eléctrico">Eléctrico</mat-option>
                <mat-option value="Choque">Choque</mat-option>
                <mat-option value="Neumático">Neumático</mat-option>
                <mat-option value="Otro">Otro</mat-option>
              </mat-select>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Prioridad</mat-label>
              <mat-select formControlName="prioridad">
                <mat-option value="">Todos</mat-option>
                <mat-option value="Alta">Alta</mat-option>
                <mat-option value="Media">Media</mat-option>
                <mat-option value="Baja">Baja</mat-option>
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
      
      @if (loading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <div class="solicitudes-list">
          @for (solicitud of solicitudes(); track solicitud.id) {
            <app-solicitud-card 
              [solicitud]="solicitud"
              (accept)="aceptarSolicitud($event)"
              (reject)="rechazarSolicitud($event)"
              (viewDetail)="verDetalle($event)">
            </app-solicitud-card>
          } @empty {
            <div class="empty-state">
              <p>No hay solicitudes disponibles que coincidan con los filtros.</p>
            </div>
          }
        </div>
      }
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
    
    .solicitudes-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
    }
    
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }
    
    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 48px 24px;
      background: #f9f9f9;
      border-radius: 8px;
      color: #666;
    }
  `]
})
export class SolicitudesDisponiblesComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastNotificationService);
  private dialog = inject(MatDialog);

  solicitudes = signal<Solicitud[]>([]);
  loading = signal<boolean>(false);

  filtersForm = this.fb.group({
    distanciaMax: [null as number | null],
    tipoProblema: [''],
    prioridad: ['']
  });

  ngOnInit() {
    this.loadSolicitudes();
  }

  loadSolicitudes() {
    this.loading.set(true);
    const formVals = this.filtersForm.value;
    
    // Construir query params
    const params = new URLSearchParams();
    if (formVals.distanciaMax) params.append('distancia', formVals.distanciaMax.toString());
    if (formVals.tipoProblema) params.append('tipo', formVals.tipoProblema);
    if (formVals.prioridad) params.append('prioridad', formVals.prioridad);
    
    const query = params.toString() ? '?' + params.toString() : '';

    this.api.get<Solicitud[]>('solicitudes/disponibles' + query).subscribe({
      next: (res) => {
        this.solicitudes.set(res || []);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Error al cargar solicitudes');
        this.loading.set(false);
      }
    });
  }

  aceptarSolicitud(solicitudId: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Aceptar solicitud',
        message: '¿Está seguro de que desea aceptar esta solicitud y asignarla a su taller?'
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loading.set(true);
        this.api.post(`solicitudes/${solicitudId}/aceptar`, {}).subscribe({
          next: () => {
            this.toast.success('Solicitud aceptada correctamente');
            this.loadSolicitudes();
          },
          error: () => {
            this.toast.error('Error al aceptar la solicitud');
            this.loading.set(false);
          }
        });
      }
    });
  }

  rechazarSolicitud(solicitudId: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Rechazar solicitud',
        message: 'Por favor, indique el motivo por el cual rechaza la solicitud (obligatorio):',
        showInput: true
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe(motivo => {
      if (typeof motivo === 'string' && motivo.trim() !== '') {
        this.loading.set(true);
        this.api.post(`solicitudes/${solicitudId}/rechazar`, { motivo }).subscribe({
          next: () => {
            this.toast.info('Solicitud rechazada');
            this.loadSolicitudes();
          },
          error: () => {
            this.toast.error('Error al rechazar la solicitud');
            this.loading.set(false);
          }
        });
      } else if (motivo === true) {
         this.toast.warning('Debe proporcionar un motivo para rechazar la solicitud');
      }
    });
  }
  
  verDetalle(solicitudId: number) {
    // Nav to detail view if needed
    this.toast.info('Navegando a detalle de solicitud ' + solicitudId);
  }
}
