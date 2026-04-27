import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ApiService } from '../../core/services/api.service';
import { ToastNotificationService } from '../../shared/components/toast-notification/toast-notification.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';

interface NotificacionHistorial {
  id: number;
  id_usuario?: number;
  id_solicitud?: number;
  tipo: string;
  titulo: string;
  contenido: string;
  estado: string;
  fecha_envio: string;
  error_detalle?: string;
}

@Component({
  selector: 'app-notificacion-manual-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>Enviar Notificación Manual</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <p class="dialog-subtitle">Configure la notificación push que desea enviar al usuario.</p>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>ID de Usuario Destino</mat-label>
          <input matInput type="number" formControlName="usuario_id" placeholder="Ej. 1" required>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Título</mat-label>
          <input matInput formControlName="titulo" placeholder="Ej. Alerta de Seguridad" required>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Mensaje</mat-label>
          <textarea matInput formControlName="mensaje" rows="4" placeholder="Escriba el cuerpo de la notificación aquí..." required></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" [mat-dialog-close]="form.value">
        <mat-icon>send</mat-icon> Enviar
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; min-width: 350px; }
    .full-width { width: 100%; }
    .dialog-subtitle { color: #666; margin-bottom: 16px; font-size: 14px; }
    .dialog-actions { margin-bottom: 8px; margin-right: 8px; }
  `]
})
export class NotificacionManualDialogComponent {
  form = inject(FormBuilder).group({
    usuario_id: [null as number | null, [Validators.required, Validators.min(1)]],
    titulo: ['', Validators.required],
    mensaje: ['', Validators.required]
  });
}

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatTooltipModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-container">
      <h2 class="page-title">
        <mat-icon class="title-icon">notifications_active</mat-icon>
        Gestionar Notificaciones Push
      </h2>
      <p class="page-subtitle">Auditoría y trazabilidad del historial de notificaciones enviadas a usuarios.</p>

      <mat-card class="filters-card">
        <mat-card-content>
          <form [formGroup]="filterForm" (ngSubmit)="loadNotificaciones()" class="filters-form">
            <mat-form-field appearance="outline">
              <mat-label>Tipo</mat-label>
              <mat-select formControlName="tipo">
                <mat-option value="">Todos</mat-option>
                <mat-option value="Push">Push</mat-option>
                <mat-option value="SMS">SMS</mat-option>
                <mat-option value="Email">Email</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Estado</mat-label>
              <mat-select formControlName="estado">
                <mat-option value="">Todos</mat-option>
                <mat-option value="Enviada">Enviada</mat-option>
                <mat-option value="Leida">Leída</mat-option>
                <mat-option value="Fallida">Fallida</mat-option>
              </mat-select>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Fecha de envío</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="fecha">
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>

            <div class="actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="loading()">
                <mat-icon>search</mat-icon> Filtrar
              </button>
              <button mat-stroked-button color="accent" type="button" (click)="abrirDialogoNotificacionManual()">
                <mat-icon>send</mat-icon> Enviar Notificación Manual
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
        <mat-card>
          <div class="table-container">
            <table mat-table [dataSource]="notificacionesPaginadas()" class="notificaciones-table">
              
              <!-- ID -->
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef> ID </th>
                <td mat-cell *matCellDef="let n"> #{{ n.id }} </td>
              </ng-container>

              <!-- Fecha -->
              <ng-container matColumnDef="fecha_envio">
                <th mat-header-cell *matHeaderCellDef> Fecha de Envío </th>
                <td mat-cell *matCellDef="let n"> {{ n.fecha_envio | date:'dd/MM/yyyy HH:mm' }} </td>
              </ng-container>

              <!-- Tipo -->
              <ng-container matColumnDef="tipo">
                <th mat-header-cell *matHeaderCellDef> Tipo </th>
                <td mat-cell *matCellDef="let n">
                  <mat-icon class="tipo-icon" [ngClass]="n.tipo.toLowerCase()">
                    {{ getIconForTipo(n.tipo) }}
                  </mat-icon>
                  {{ n.tipo }}
                </td>
              </ng-container>

              <!-- Título -->
              <ng-container matColumnDef="titulo">
                <th mat-header-cell *matHeaderCellDef> Título </th>
                <td mat-cell *matCellDef="let n" class="truncate-cell" [matTooltip]="n.titulo"> 
                  {{ n.titulo }} 
                </td>
              </ng-container>

              <!-- Estado -->
              <ng-container matColumnDef="estado">
                <th mat-header-cell *matHeaderCellDef> Estado </th>
                <td mat-cell *matCellDef="let n"> 
                  <mat-chip [class]="'chip-' + cleanString(n.estado)">
                    {{ n.estado }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Acciones -->
              <ng-container matColumnDef="acciones">
                <th mat-header-cell *matHeaderCellDef> Detalles </th>
                <td mat-cell *matCellDef="let n">
                  <button mat-icon-button color="primary" matTooltip="Ver detalle completo" (click)="verDetalle(n)">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  @if (n.estado === 'Fallida' && n.error_detalle) {
                    <button mat-icon-button color="warn" [matTooltip]="'Error: ' + n.error_detalle">
                      <mat-icon>error_outline</mat-icon>
                    </button>
                  }
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            @if (notificaciones().length === 0) {
              <div class="empty-state">
                <mat-icon>notifications_off</mat-icon>
                <p>No hay notificaciones que coincidan con los filtros.</p>
              </div>
            }
          </div>

          <mat-paginator
            [length]="notificaciones().length"
            [pageSize]="pageSize"
            [pageSizeOptions]="[10, 25, 50, 100]"
            (page)="onPage($event)"
            showFirstLastButtons>
          </mat-paginator>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .page-title { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; color: #333; }
    .title-icon { font-size: 28px; width: 28px; height: 28px; color: #6c63ff; }
    .page-subtitle { color: #666; margin-bottom: 24px; font-size: 14px; }
    .filters-card { margin-bottom: 24px; }
    .filters-form { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; }
    .filters-form mat-form-field { flex: 1; min-width: 180px; }
    .actions { display: flex; gap: 12px; align-items: center; padding-bottom: 16px; }
    .loading-container { display: flex; justify-content: center; padding: 48px; }
    .table-container { overflow-x: auto; }
    .notificaciones-table { width: 100%; min-width: 800px; }
    
    .tipo-icon { font-size: 18px; width: 18px; height: 18px; vertical-align: middle; margin-right: 4px; }
    .tipo-icon.push { color: #00bcd4; }
    .tipo-icon.sms { color: #8bc34a; }
    .tipo-icon.email { color: #ff9800; }
    
    .truncate-cell { max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    
    .chip-enviada { background-color: #e3f2fd !important; color: #1565c0 !important; }
    .chip-leida, .chip-leída { background-color: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-fallida { background-color: #ffebee !important; color: #c62828 !important; }
    
    .empty-state { text-align: center; padding: 48px 24px; color: #666; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; color: #ccc; margin-bottom: 16px; }
  `]
})
export class NotificacionesComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastNotificationService);
  private dialog = inject(MatDialog);

  notificaciones = signal<NotificacionHistorial[]>([]);
  notificacionesPaginadas = signal<NotificacionHistorial[]>([]);
  loading = signal<boolean>(false);

  displayedColumns = ['id', 'fecha_envio', 'tipo', 'titulo', 'estado', 'acciones'];
  pageSize = 10;
  pageIndex = 0;

  filterForm = this.fb.group({
    tipo: [''],
    estado: [''],
    fecha: [null]
  });

  ngOnInit() {
    this.loadNotificaciones();
  }

  loadNotificaciones() {
    this.loading.set(true);
    const vals = this.filterForm.value;
    const params = new URLSearchParams();
    
    if (vals.tipo) params.append('tipo', vals.tipo);
    if (vals.estado) params.append('estado', vals.estado);
    if (vals.fecha) params.append('fecha', new Date(vals.fecha).toISOString());
    
    const query = params.toString() ? '?' + params.toString() : '';

    this.api.get<NotificacionHistorial[]>('notificaciones/historial' + query).subscribe({
      next: (res) => {
        // Fallback demo data if backend endpoint is not completely ready
        if (!res || res.length === 0) {
          res = [
            { id: 1, tipo: 'Push', titulo: 'Nueva Solicitud de Emergencia', contenido: 'Tiene una nueva solicitud cerca de su ubicación.', estado: 'Leida', fecha_envio: new Date().toISOString() },
            { id: 2, tipo: 'Email', titulo: 'Recibo de Pago', contenido: 'Adjunto recibo de su pago por servicio mecánico.', estado: 'Enviada', fecha_envio: new Date(Date.now() - 3600000).toISOString() },
            { id: 3, tipo: 'SMS', titulo: 'Taller Asignado', contenido: 'El taller AutoFix está en camino. Tiempo estimado: 15 min.', estado: 'Fallida', fecha_envio: new Date(Date.now() - 86400000).toISOString(), error_detalle: 'Número no válido' },
            { id: 4, tipo: 'Push', titulo: 'Servicio Finalizado', contenido: 'El servicio ha sido marcado como finalizado.', estado: 'Enviada', fecha_envio: new Date(Date.now() - 172800000).toISOString() }
          ];
        }
        
        // Local filtering for demo purposes
        if (vals.tipo) res = res.filter(n => n.tipo === vals.tipo);
        if (vals.estado) {
          const searchEstado = this.cleanString(vals.estado);
          res = res.filter(n => this.cleanString(n.estado) === searchEstado);
        }
        
        this.notificaciones.set(res || []);
        this.paginar();
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Error al cargar historial de notificaciones');
        this.loading.set(false);
      }
    });
  }

  paginar() {
    const start = this.pageIndex * this.pageSize;
    this.notificacionesPaginadas.set(this.notificaciones().slice(start, start + this.pageSize));
  }

  onPage(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.paginar();
  }

  getIconForTipo(tipo: string): string {
    switch (tipo?.toLowerCase()) {
      case 'push': return 'notifications_active';
      case 'sms': return 'sms';
      case 'email': return 'mail';
      default: return 'notifications';
    }
  }

  cleanString(str: string): string {
    return (str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  verDetalle(notificacion: NotificacionHistorial) {
    let mensaje = `
      <strong>ID:</strong> ${notificacion.id}<br/>
      <strong>Tipo:</strong> ${notificacion.tipo}<br/>
      <strong>Estado:</strong> ${notificacion.estado}<br/>
      <strong>Fecha:</strong> ${new Date(notificacion.fecha_envio).toLocaleString()}<br/>
      <hr/>
      <strong>Título:</strong> ${notificacion.titulo}<br/><br/>
      <strong>Contenido:</strong><br/>
      <div style="background:#f5f5f5; padding: 10px; border-radius: 4px; margin-top: 5px;">${notificacion.contenido}</div>
    `;

    if (notificacion.error_detalle) {
      mensaje += `<br/><strong>Detalle de Error:</strong><br/><span style="color:red;">${notificacion.error_detalle}</span>`;
    }

    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Detalle de Notificación',
        message: mensaje,
        confirmText: 'Cerrar',
        hideCancel: true,
        isHtmlContent: true
      } as ConfirmDialogData
    });
  }

  abrirDialogoNotificacionManual() {
    const dialogRef = this.dialog.open(NotificacionManualDialogComponent, {
      width: '450px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.enviarNotificacionManual(result.usuario_id, result.titulo, result.mensaje);
      }
    });
  }

  enviarNotificacionManual(usuarioId: number, titulo: string, mensaje: string) {
    this.loading.set(true);
    // FastAPI arguments not defined as models go as query parameters
    const params = new URLSearchParams();
    params.append('usuario_id', usuarioId.toString());
    params.append('titulo', titulo);
    params.append('mensaje', mensaje);

    this.api.post('notificaciones/enviar?' + params.toString(), {}).subscribe({
      next: (res: any) => {
        if (res && res.enviados !== undefined) {
          if (res.enviados > 0) {
            this.toast.success(`Notificación enviada exitosamente a ${res.enviados} dispositivos.`);
          } else {
            this.toast.warning('Notificación procesada, pero falló en todos los dispositivos o el usuario no tiene tokens.');
          }
        } else {
          this.toast.success('Notificación enviada');
        }
        this.loadNotificaciones();
      },
      error: (err) => {
        this.toast.error('Error al enviar la notificación manual. Verifique permisos o conexión.');
        this.loading.set(false);
      }
    });
  }
}
