import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { forkJoin } from 'rxjs';

import { Usuario, Rol } from '../../core/models/index';
import { ApiService } from '../../core/services/api.service';
import { ToastNotificationService } from '../../shared/components/toast-notification/toast-notification.service';
import { UserFormComponent } from './components/user-form/user-form.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatIconModule, 
    MatButtonModule, 
    MatTableModule, 
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div>
          <h1 class="page-title">Gestión de Usuarios</h1>
          <p class="page-sub">Administra todos los usuarios del sistema y sus roles</p>
        </div>
        <button mat-flat-button class="add-btn" (click)="openNewUserDialog()">
          <mat-icon>person_add</mat-icon> Nuevo usuario
        </button>
      </div>

      <!-- Sección de Filtros -->
      <mat-card class="filter-card">
        <div class="filter-grid">
          <mat-form-field appearance="outline" class="filter-item">
            <mat-label>Filtrar por Rol</mat-label>
            <mat-select [value]="rolFilter()" (selectionChange)="onRolFilterChange($event.value)">
              <mat-option [value]="null">Todos los roles</mat-option>
              <mat-option *ngFor="let r of roles()" [value]="r.nombre">{{ r.nombre }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-item">
            <mat-label>Estado</mat-label>
            <mat-select [value]="activoFilter()" (selectionChange)="onStatusFilterChange($event.value)">
              <mat-option [value]="null">Todos los estados</mat-option>
              <mat-option [value]="true">Activos</mat-option>
              <mat-option [value]="false">Inactivos</mat-option>
            </mat-select>
          </mat-form-field>

          <div class="filter-actions">
            <button mat-stroked-button color="warn" (click)="clearFilters()" *ngIf="rolFilter() || activoFilter() !== null">
              <mat-icon>filter_list_off</mat-icon> Limpiar
            </button>
          </div>
        </div>
      </mat-card>

      <div *ngIf="loading()" class="loading-state">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <mat-card class="table-card" *ngIf="!loading()">
        <table mat-table [dataSource]="usuarios()" class="users-table">
          <ng-container matColumnDef="nombre">
            <th mat-header-cell *matHeaderCellDef>Nombre</th>
            <td mat-cell *matCellDef="let u">
              <span class="user-name">{{ u.nombre }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let u">
              <span class="user-email">{{ u.email }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="rol">
            <th mat-header-cell *matHeaderCellDef>Rol</th>
            <td mat-cell *matCellDef="let u">
              <mat-chip [class]="'chip-' + (u.roles?.[0]?.nombre || u.rol?.nombre || 'none')">
                {{ u.roles?.[0]?.nombre || u.rol?.nombre || '—' }}
              </mat-chip>
            </td>
          </ng-container>
          <ng-container matColumnDef="activo">
            <th mat-header-cell *matHeaderCellDef>Estado</th>
            <td mat-cell *matCellDef="let u">
              <div class="status-cell" (click)="$event.stopPropagation()">
                <mat-slide-toggle 
                  [checked]="u.activo" 
                  (change)="toggleUserStatus(u)"
                  color="primary">
                </mat-slide-toggle>
                <span [class]="u.activo ? 'badge-active' : 'badge-inactive'">
                  {{ u.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
            </td>
          </ng-container>
          <ng-container matColumnDef="acciones">
            <th mat-header-cell *matHeaderCellDef>Acciones</th>
            <td mat-cell *matCellDef="let u">
              <div class="actions-cell">
                <button mat-icon-button (click)="openEditUserDialog(u)" matTooltip="Editar usuario">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteUser(u)" matTooltip="Eliminar usuario">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>

        <!-- Paginador -->
        <mat-paginator 
          [length]="totalUsers()"
          [pageSize]="pageSize()"
          [pageSizeOptions]="[5, 10, 25]"
          [pageIndex]="pageIndex() - 1"
          (page)="onPageChange($event)"
          aria-label="Seleccionar página">
        </mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-wrapper { color: #333; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
    .page-title { font-size: 1.8rem; font-weight: 800; margin: 0 0 4px; background: linear-gradient(135deg,#6c63ff,#4ecdc4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .page-sub { color: #888; margin: 0; font-size: 0.9rem; }
    .add-btn { background: linear-gradient(135deg,#6c63ff,#4ecdc4) !important; color: #fff !important; border-radius: 10px; }
    
    .filter-card { margin-bottom: 24px; padding: 16px; background: #fff !important; border: 1px solid #e5e7eb !important; border-radius: 16px !important; }
    .filter-grid { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
    .filter-item { flex: 1 1 200px; min-width: 200px; }
    .filter-actions { display: flex; align-items: center; }

    .table-card { background: #fff !important; border: 1px solid #e5e7eb !important; border-radius: 16px !important; overflow: hidden; }
    .users-table { width: 100%; background: transparent !important; }
    th { color: #6b7280 !important; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e5e7eb !important; }
    td { color: #333 !important; border-bottom: 1px solid #f3f4f6 !important; }
    .user-info { display: flex; flex-direction: column; }
    .user-name { font-weight: 600; }
    .user-email { font-size: 0.8rem; color: #6b7280; }
    .status-cell { display: flex; align-items: center; gap: 12px; }
    .badge-active { background: rgba(16,185,129,0.1); color: #10b981; padding: 4px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; }
    .badge-inactive { background: rgba(239,68,68,0.1); color: #ef4444; padding: 4px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; }
    .actions-cell { display: flex; gap: 4px; }
    .loading-state { display: flex; justify-content: center; align-items: center; padding: 40px; }
  `],
})
export class GestionUsuariosComponent implements OnInit {
  private apiService = inject(ApiService);
  private toastService = inject(ToastNotificationService);
  private dialog = inject(MatDialog);
  
  readonly columns = ['nombre', 'email', 'rol', 'activo', 'acciones'];
  
  // State Signals
  usuarios = signal<Usuario[]>([]);
  roles = signal<Rol[]>([]);
  loading = signal<boolean>(false);
  
  // Filtering & Pagination Signals
  totalUsers = signal<number>(0);
  pageIndex = signal<number>(1);
  pageSize = signal<number>(10);
  rolFilter = signal<string | null>(null);
  activoFilter = signal<boolean | null>(null);

  ngOnInit() {
    // Primera carga para obtener roles y la primera página de usuarios
    this.refreshData(true);
  }

  refreshData(loadRoles = false) {
    this.loading.set(true);
    
    // Construcción de Query Params
    let params = new URLSearchParams();
    params.append('page', this.pageIndex().toString());
    params.append('limit', this.pageSize().toString());
    
    if (this.rolFilter()) params.append('rol', this.rolFilter()!);
    if (this.activoFilter() !== null) params.append('activo', this.activoFilter()!.toString());

    const endpoint = `admin/usuarios?${params.toString()}`;

    const requests: any = {
      usuarios: this.apiService.get<{data: Usuario[], total: number} | Usuario[]>(endpoint)
    };

    if (loadRoles) {
      requests.roles = this.apiService.get<{data: Rol[]} | Rol[]>('admin/roles');
    }

    forkJoin(requests).subscribe({
      next: (res: any) => {
        const usersData = Array.isArray(res.usuarios) ? res.usuarios : res.usuarios.data;
        const total = Array.isArray(res.usuarios) ? res.usuarios.length : (res.usuarios.total || res.usuarios.data.length);
        
        console.log('Users Data Debug:', usersData);
        this.usuarios.set(usersData || []);
        this.totalUsers.set(total);

        if (loadRoles && res.roles) {
          const rolesData = Array.isArray(res.roles) ? res.roles : res.roles.data;
          this.roles.set(rolesData || []);
        }
        
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching data:', err);
        this.toastService.error('Error al cargar datos del servidor');
        this.loading.set(false);
      }
    });
  }

  // Handlers para Filtros y Paginación
  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.refreshData();
  }

  onRolFilterChange(rol: string | null) {
    this.rolFilter.set(rol);
    this.pageIndex.set(1); // Reset a primera página al filtrar
    this.refreshData();
  }

  onStatusFilterChange(status: any) {
    this.activoFilter.set(status);
    this.pageIndex.set(1);
    this.refreshData();
  }

  clearFilters() {
    this.rolFilter.set(null);
    this.activoFilter.set(null);
    this.pageIndex.set(1);
    this.refreshData();
  }

  // CRUD Methods
  openNewUserDialog() {
    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '450px',
      data: { roles: this.roles() }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading.set(true);
        const { rol_ids, ...userData } = result;
        
        // 1. Crear usuario (datos básicos)
        this.apiService.post<Usuario>('admin/usuarios', { data: userData }).subscribe({
          next: (newUser) => {
            // 2. Asignar roles al usuario recién creado
            this.apiService.put(`admin/usuarios/${newUser.id}/roles`, { rol_ids }).subscribe({
              next: () => {
                this.toastService.success('Usuario creado y roles asignados');
                this.refreshData();
              },
              error: () => {
                this.toastService.error('Usuario creado pero no se pudieron asignar los roles');
                this.refreshData();
              }
            });
          },
          error: (err) => {
            console.error('Error creating user:', err);
            this.toastService.error('Error al crear el usuario');
            this.loading.set(false);
          }
        });
      }
    });
  }

  openEditUserDialog(user: Usuario) {
    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '450px',
      data: { user, roles: this.roles() }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading.set(true);
        const { rol_ids, ...userData } = result;

        // Verificamos qué se está enviando exactamente al backend para nombre y email
        console.log('>>> ENVIANDO AL BACKEND (PATCH):', {
          id: user.id,
          nombre: userData.nombre,
          email: userData.email,
          payload_completo: { ...userData, data: userData }
        });

        // 1. Actualizar datos básicos (enviamos en raíz y en data por seguridad)
        this.apiService.patch<Usuario>(`admin/usuarios/${user.id}`, { ...userData, data: userData }).subscribe({
          next: (patchRes) => {
            console.log('>>> RESPUESTA BACKEND (PATCH):', patchRes);
            
            // 2. Actualizar roles en el endpoint dedicado
            this.apiService.put(`admin/usuarios/${user.id}/roles`, { rol_ids }).subscribe({
              next: () => {
                this.toastService.success('Usuario y roles actualizados');
                this.refreshData();
              },
              error: (err) => {
                this.toastService.error('Error al actualizar roles');
                this.refreshData();
              }
            });
          },
          error: (err) => {
            console.error('>>> ERROR BACKEND (PATCH):', err);
            this.toastService.error('Error al actualizar el usuario');
            this.loading.set(false);
          }
        });
      }
    });
  }

  toggleUserStatus(user: Usuario) {
    const nuevoEstado = !user.activo;
    this.apiService.put<{message: string}>(`admin/usuarios/${user.id}/estado?activo=${nuevoEstado}`, {}).subscribe({
      next: () => {
        this.toastService.success(`Usuario ${nuevoEstado ? 'activado' : 'desactivado'}`);
        this.usuarios.update(users => users.map(u => u.id === user.id ? { ...u, activo: nuevoEstado } : u));
      },
      error: (err) => {
        console.error(err);
        this.toastService.error('Error al cambiar el estado del usuario');
      }
    });
  }

  deleteUser(user: Usuario) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar Usuario',
        message: `¿Estás seguro de que deseas eliminar al usuario "${user.nombre}"? Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.loading.set(true);
        this.apiService.delete(`admin/usuarios/${user.id}`).subscribe({
          next: () => {
            this.toastService.success('Usuario eliminado exitosamente');
            this.refreshData();
          },
          error: (err) => {
            console.error(err);
            this.toastService.error('Error al eliminar el usuario');
            this.loading.set(false);
          }
        });
      }
    });
  }
}
