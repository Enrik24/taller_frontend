import { ChangeDetectionStrategy, Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Rol, Permiso } from '../../core/models/index';
import { ApiService } from '../../core/services/api.service';
import { ToastNotificationService } from '../../shared/components/toast-notification/toast-notification.service';
import { forkJoin, switchMap, catchError, of } from 'rxjs';
import { RoleFormComponent } from './components/role-form/role-form.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-gestion-roles',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatIconModule, 
    MatButtonModule, 
    MatProgressSpinnerModule, 
    MatDialogModule,
    MatTooltipModule
  ],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div>
          <h1 class="page-title">Gestión de Roles</h1>
          <p class="page-sub">Define los permisos para cada rol en el sistema</p>
        </div>
        <button mat-raised-button class="add-btn" (click)="openNewRoleDialog()">
          <mat-icon>add</mat-icon> Crear Rol
        </button>
      </div>

      <div *ngIf="loading()" class="loading-state">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div *ngIf="!loading()" class="roles-grid">
        <div class="role-card" *ngFor="let rol of roles()">
          <div class="role-header">
            <h2 class="role-title">{{ rol.nombre }}</h2>
            <div class="role-actions">
              <a class="action-edit" (click)="openEditRoleDialog(rol)">Editar Rol</a>
              <a class="action-delete" (click)="deleteRole(rol)">Eliminar</a>
            </div>
          </div>
          <p class="role-desc">{{ rol.descripcion || 'Sin descripción' }}</p>
          
          <div class="role-permissions">
            <p class="permissions-label">PERMISOS ASIGNADOS:</p>
            <div class="chips-container">
              <span class="chip" *ngFor="let permiso of rol.permisos">{{ permiso.nombre }}</span>
              <span class="chip-empty" *ngIf="!rol.permisos || rol.permisos.length === 0">Sin permisos</span>
            </div>
          </div>
        </div>
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
    
    .roles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
      align-items: start;
    }

    .role-card {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }

    .role-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .role-title {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: #111827;
    }

    .role-actions {
      display: flex;
      gap: 12px;
    }

    .action-edit {
      color: #3b82f6;
      cursor: pointer;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
    }

    .action-edit:hover {
      text-decoration: underline;
    }

    .action-delete {
      color: #ef4444;
      cursor: pointer;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
    }

    .action-delete:hover {
      text-decoration: underline;
    }

    .role-desc {
      color: #6b7280;
      font-size: 14px;
      margin: 0 0 24px;
    }

    .permissions-label {
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      margin: 0 0 12px;
      letter-spacing: 0.5px;
    }

    .chips-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .chip {
      background-color: #d1fae5;
      color: #065f46;
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }

    .chip-empty {
      color: #9ca3af;
      font-size: 13px;
      font-style: italic;
    }
  `],
})
export class GestionRolesComponent implements OnInit {
  private apiService = inject(ApiService);
  private toastService = inject(ToastNotificationService);
  private dialog = inject(MatDialog);

  roles = signal<Rol[]>([]);
  permisos = signal<Permiso[]>([]);
  loading = signal<boolean>(false);

  ngOnInit() {
    this.refreshData();
  }

  refreshData() {
    this.loading.set(true);
    forkJoin({
      roles: this.apiService.get<{data: Rol[]} | Rol[]>('admin/roles'),
      permisos: this.apiService.get<{data: Permiso[]} | Permiso[]>('admin/permisos')
    }).subscribe({
      next: (res) => {
        const rolesData = Array.isArray(res.roles) ? res.roles : (res.roles as any).data;
        const permisosData = Array.isArray(res.permisos) ? res.permisos : (res.permisos as any).data;
        
        this.roles.set(rolesData || []);
        this.permisos.set(permisosData || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.loadMockData();
        this.loading.set(false);
      }
    });
  }

  loadMockData() {
    this.permisos.set([
      { id: 1, codigo: 'USUARIOS_READ', nombre: 'Ver usuarios', accion: 'read' },
      { id: 2, codigo: 'USUARIOS_WRITE', nombre: 'Editar usuarios', accion: 'write' },
      { id: 3, codigo: 'SOLICITUDES_READ', nombre: 'Ver solicitudes', accion: 'read' },
      { id: 4, codigo: 'SOLICITUDES_WRITE', nombre: 'Gestionar solicitudes', accion: 'write' },
    ]);
    this.roles.set([
      { id: 1, nombre: 'Admin', descripcion: 'Acceso total al sistema', permisos: this.permisos() },
      { id: 2, nombre: 'Taller', descripcion: 'Gestión de servicios y atención', permisos: [this.permisos()[2], this.permisos()[3]] },
      { id: 3, nombre: 'Cliente', descripcion: 'Solicitar y rastrear emergencias', permisos: [this.permisos()[3]] },
    ]);
  }



  openNewRoleDialog() {
    const dialogRef = this.dialog.open(RoleFormComponent, {
      width: '500px',
      data: { permisos: this.permisos() }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading.set(true);
        // Step 1: Create the role
        this.apiService.post<any>('admin/roles', { 
          nombre: result.nombre, 
          descripcion: result.descripcion
        }).pipe(
          // Step 2: Assign permissions in a second call
          switchMap(response => {
            const roleId = response.data?.id || response.id;
            return this.apiService.put<any>(`admin/roles/${roleId}/permisos`, { 
              permiso_ids: result.permiso_ids 
            });
          })
        ).subscribe({
          next: () => {
            this.toastService.success('Rol creado y permisos asignados exitosamente');
            this.refreshData();
          },
          error: (err) => {
            console.error(err);
            this.toastService.error('Error al crear el rol o asignar permisos');
            this.loading.set(false);
          }
        });
      }
    });
  }

  deleteRole(rol: Rol) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar Rol',
        message: `¿Está seguro de que desea eliminar el rol "${rol.nombre}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading.set(true);
        this.apiService.delete(`admin/roles/${rol.id}`).subscribe({
          next: () => {
            this.toastService.success('Rol eliminado exitosamente');
            this.refreshData();
          },
          error: (err) => {
            console.error(err);
            this.toastService.error('Error al eliminar el rol');
            this.loading.set(false);
          }
        });
      }
    });
  }

  openEditRoleDialog(rol: Rol) {
    const dialogRef = this.dialog.open(RoleFormComponent, {
      width: '500px',
      data: { role: rol, permisos: this.permisos() }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading.set(true);
        
        // Step 1: Update permissions (PUT)
        this.apiService.put<any>(`admin/roles/${rol.id}/permisos`, { 
          permiso_ids: result.permiso_ids 
        }).pipe(
          // Step 2: Update role data (PATCH) - same format as usuarios module
          switchMap(() => {
            const roleData = {
              nombre: result.nombre,
              descripcion: result.descripcion
            };
            return this.apiService.patch<any>(`admin/roles/${rol.id}`, { ...roleData, data: roleData }).pipe(
              catchError((err) => {
                console.error('PATCH role failed:', err);
                this.toastService.warning('Permisos actualizados, pero no se pudo actualizar nombre/descripción del rol');
                return of(null);
              })
            );
          })
        ).subscribe({
          next: () => {
            this.toastService.success('Rol actualizado exitosamente');
            this.refreshData();
          },
          error: (err) => {
            console.error(err);
            this.toastService.error('Error al actualizar los permisos del rol');
            this.refreshData();
          }
        });
      }
    });
  }


}
