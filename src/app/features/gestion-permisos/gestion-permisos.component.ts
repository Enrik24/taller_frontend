import { ChangeDetectionStrategy, Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Permiso } from '../../core/models/index';
import { ApiService } from '../../core/services/api.service';
import { ToastNotificationService } from '../../shared/components/toast-notification/toast-notification.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { PermisoFormComponent } from './components/permiso-form/permiso-form.component';

@Component({
  selector: 'app-gestion-permisos',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatPaginatorModule
  ],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div>
          <h1 class="page-title">Gestión de Permisos</h1>
          <p class="page-sub">Define los permisos disponibles en el sistema</p>
        </div>
        <div class="actions">
          <button mat-flat-button class="add-btn" (click)="openNewPermisoDialog()">
            <mat-icon>add</mat-icon> Nuevo permiso
          </button>
        </div>
      </div>

      <div *ngIf="loading()" class="loading-state">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div *ngIf="!loading()" class="permisos-list">
        <div class="permiso-card" *ngFor="let permiso of paginatedPermisos()">
          <div class="permiso-header">
            {{ getGroup(permiso.codigo) }}
          </div>
          <div class="permiso-body">
            <div class="permiso-info">
              <h3>{{ permiso.nombre }}</h3>
              <p class="desc">{{ permiso.descripcion || 'Sin descripción' }}</p>
              <p class="codigo">Código: {{ permiso.codigo }}</p>
            </div>
            <div class="permiso-actions">
              <a class="action-edit" (click)="openEditPermisoDialog(permiso)">Editar</a>
              <a class="action-delete" (click)="handleDeletePermiso(permiso)">Eliminar</a>
            </div>
          </div>
        </div>

        <mat-paginator
          [length]="permisos().length"
          [pageSize]="pageSize()"
          [pageIndex]="pageIndex()"
          [pageSizeOptions]="[5, 10, 20]"
          showFirstLastButtons
          (page)="onPageChange($event)"
          class="paginator">
        </mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .page-wrapper { color: #333; display: flex; flex-direction: column; gap: 20px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .page-title { font-size: 1.8rem; font-weight: 800; margin: 0 0 4px; background: linear-gradient(135deg,#6c63ff,#4ecdc4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .page-sub { color: #888; margin: 0; font-size: 0.9rem; }
    .add-btn { background: linear-gradient(135deg,#6c63ff,#4ecdc4) !important; color: #fff !important; border-radius: 10px; }
    
    .loading-state { display: flex; justify-content: center; align-items: center; padding: 40px; }
    
    .permisos-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .permiso-card {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }

    .permiso-header {
      background-color: #f9fafb;
      padding: 12px 16px;
      border-bottom: 1px solid #e5e7eb;
      font-weight: 600;
      color: #1f2937;
      font-size: 14px;
    }

    .permiso-body {
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .permiso-info h3 {
      margin: 0 0 4px;
      font-size: 16px;
      font-weight: 600;
      color: #111827;
    }

    .permiso-info .desc {
      margin: 0 0 4px;
      font-size: 14px;
      color: #6b7280;
    }

    .permiso-info .codigo {
      margin: 0;
      font-size: 13px;
      color: #9ca3af;
    }

    .permiso-actions {
      display: flex;
      gap: 12px;
    }

    .action-edit {
      color: #3b82f6;
      cursor: pointer;
      text-decoration: none;
      font-size: 14px;
    }

    .action-delete {
      color: #ef4444;
      cursor: pointer;
      text-decoration: none;
      font-size: 14px;
    }

    .action-edit:hover, .action-delete:hover {
      text-decoration: underline;
    }

    .paginator {
      margin-top: 8px;
      background: transparent;
      border-radius: 8px;
    }
  `]
})
export class GestionPermisosComponent implements OnInit {
  private apiService = inject(ApiService);
  private toastService = inject(ToastNotificationService);
  private dialog = inject(MatDialog);

  permisos = signal<Permiso[]>([]);
  loading = signal<boolean>(false);
  pageIndex = signal(0);
  pageSize = signal(5);

  paginatedPermisos = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.permisos().slice(start, start + this.pageSize());
  });

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  ngOnInit() {
    this.refreshData();
  }

  refreshData() {
    this.loading.set(true);
    this.apiService.get<{data: Permiso[]} | Permiso[]>('admin/permisos').subscribe({
      next: (res) => {
        const permisosData = Array.isArray(res) ? res : (res as any).data;
        this.permisos.set(permisosData || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loadMockData();
        this.loading.set(false);
      }
    });
  }

  loadMockData() {
    this.permisos.set([
      { id: 1, codigo: 'bombas.crear', nombre: 'Crear Bombas', descripcion: 'Permiso para crear bombas de combustible' },
      { id: 2, codigo: 'bombas.editar', nombre: 'Editar Bombas', descripcion: 'Permiso para editar bombas de combustible' },
      { id: 3, codigo: 'bombas.eliminar', nombre: 'Eliminar Bombas', descripcion: 'Permiso para eliminar bombas de combustible' }
    ]);
  }

  getGroup(codigo: string): string {
    if (!codigo) return 'General';
    const parts = codigo.split('.');
    if (parts.length > 1) {
      const p = parts[0];
      return p.charAt(0).toUpperCase() + p.slice(1);
    }
    return 'General';
  }

  openNewPermisoDialog() {
    const dialogRef = this.dialog.open(PermisoFormComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading.set(true);
        this.apiService.post<Permiso>('admin/permisos', result).subscribe({
          next: () => {
            this.toastService.success('Permiso creado exitosamente');
            this.refreshData();
          },
          error: (err) => {
            console.error(err);
            this.toastService.error('Error al crear el permiso');
            this.loading.set(false);
          }
        });
      }
    });
  }

  openEditPermisoDialog(permiso: Permiso) {
    const dialogRef = this.dialog.open(PermisoFormComponent, {
      width: '500px',
      data: { permiso }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading.set(true);
        this.apiService.patch<Permiso>(`admin/permisos/${permiso.id}`, result).subscribe({
          next: () => {
            this.toastService.success('Permiso actualizado exitosamente');
            this.refreshData();
          },
          error: (err) => {
            console.error(err);
            this.toastService.error('Error al actualizar el permiso');
            this.loading.set(false);
          }
        });
      }
    });
  }

  handleDeletePermiso(permiso: Permiso) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar Permiso',
        message: `¿Estás seguro de que deseas eliminar el permiso "${permiso.nombre}"? Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.loading.set(true);
        this.apiService.delete(`admin/permisos/${permiso.id}`).subscribe({
          next: () => {
            this.toastService.success('Permiso eliminado exitosamente');
            this.refreshData();
          },
          error: (err) => {
            console.error(err);
            this.toastService.error('Error al eliminar el permiso');
            this.loading.set(false);
          }
        });
      }
    });
  }
}
