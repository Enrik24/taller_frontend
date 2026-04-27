import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(
        (m) => m.RegisterComponent,
      ),
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import(
            './features/gestion-usuarios/gestion-usuarios.component'
          ).then((m) => m.GestionUsuariosComponent),
        canActivate: [roleGuard],
        data: { roles: ['administrador'] },
      },
      {
        path: 'roles',
        loadComponent: () =>
          import('./features/gestion-roles/gestion-roles.component').then(
            (m) => m.GestionRolesComponent,
          ),
        canActivate: [roleGuard],
        data: { roles: ['administrador'] },
      },
      {
        path: 'permisos',
        loadComponent: () =>
          import('./features/gestion-permisos/gestion-permisos.component').then(
            (m) => m.GestionPermisosComponent,
          ),
        canActivate: [roleGuard],
        data: { roles: ['administrador'] },
      },
      {
        path: 'bitacora',
        loadComponent: () =>
          import('./features/bitacora/bitacora.component').then(
            (m) => m.BitacoraComponent,
          ),
        canActivate: [roleGuard],
        data: { roles: ['administrador'] },
      },
      {
        path: 'solicitudes-disponibles',
        loadComponent: () =>
          import(
            './features/servicios-taller/solicitudes-disponibles/solicitudes-disponibles.component'
          ).then((m) => m.SolicitudesDisponiblesComponent),
        canActivate: [roleGuard],
        data: { roles: ['taller'] },
      },
      {
        path: 'historial-taller',
        loadComponent: () =>
          import(
            './features/servicios-taller/historial/historial.component'
          ).then((m) => m.HistorialComponent),
        canActivate: [roleGuard],
        data: { roles: ['taller'] },
      },
      {
        path: 'reportar-emergencia',
        loadComponent: () =>
          import('./features/emergencias/reportar/reportar.component').then(
            (m) => m.ReportarComponent,
          ),
        canActivate: [roleGuard],
        data: { roles: ['cliente'] },
      },
      {
        path: 'mis-solicitudes',
        loadComponent: () =>
          import(
            './features/emergencias/mis-solicitudes/mis-solicitudes.component'
          ).then((m) => m.MisSolicitudesComponent),
        canActivate: [roleGuard],
        data: { roles: ['cliente'] },
      },
      {
        path: 'pagos',
        loadComponent: () =>
          import('./features/transacciones/pagos/pagos.component').then(
            (m) => m.PagosComponent,
          ),
      },
      {
        path: 'comisiones',
        loadComponent: () =>
          import(
            './features/transacciones/comisiones/comisiones.component'
          ).then((m) => m.ComisionesComponent),
        canActivate: [roleGuard],
        data: { roles: ['administrador'] },
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./features/perfil/perfil.component').then(
            (m) => m.PerfilComponent,
          ),
      },
      {
        path: 'notificaciones',
        loadComponent: () => import('./features/notificaciones/notificaciones.component').then(m => m.NotificacionesComponent),
        canActivate: [roleGuard],
        data: { roles: ['administrador'] },
      },
      {
        path: 'taller-asignado',
        loadComponent: () => import('./features/emergencias/taller-asignado/taller-asignado.component').then(m => m.TallerAsignadoComponent),
        canActivate: [roleGuard],
        data: { roles: ['cliente'] },
      },
      {
        path: 'actualizar-estado',
        loadComponent: () => import('./features/servicios-taller/actualizar-estado/actualizar-estado.component').then(m => m.ActualizarEstadoComponent),
        canActivate: [roleGuard],
        data: { roles: ['taller'] },
      },
      {
        path: 'gestion-talleres',
        loadComponent: () => import('./features/servicios-taller/gestion-talleres/gestion-talleres.component').then(m => m.GestionTalleresComponent),
        canActivate: [roleGuard],
        data: { roles: ['administrador'] },
      },
      {
        path: 'gestion-clientes',
        loadComponent: () => import('./features/servicios-taller/gestion-clientes/gestion-clientes.component').then(m => m.GestionClientesComponent),
        canActivate: [roleGuard],
        data: { roles: ['administrador'] },
      },
      {
        path: 'procesar-evidencias',
        loadComponent: () => import('./features/servicios-taller/procesar-evidencias/procesar-evidencias.component').then(m => m.ProcesarEvidenciasComponent),
        canActivate: [roleGuard],
        data: { roles: ['taller'] },
      },
      {
        path: 'consultar-info-ia',
        loadComponent: () => import('./features/servicios-taller/consultar-info-ia/consultar-info-ia.component').then(m => m.ConsultarInfoIaComponent),
        canActivate: [roleGuard],
        data: { roles: ['taller'] },
      },
      {
        path: 'aceptar-rechazar',
        loadComponent: () => import('./features/servicios-taller/aceptar-rechazar/aceptar-rechazar.component').then(m => m.AceptarRechazarComponent),
        canActivate: [roleGuard],
        data: { roles: ['taller'] },
      },
      {
        path: 'asignacion-inteligente',
        loadComponent: () => import('./features/servicios-taller/asignacion-inteligente/asignacion-inteligente.component').then(m => m.AsignacionInteligenteComponent),
        canActivate: [roleGuard],
        data: { roles: ['taller'] },
      },
      {
        path: 'historial-atenciones',
        loadComponent: () => import('./features/transacciones/historial-atenciones/historial-atenciones.component').then(m => m.HistorialAtencionesComponent),
        // can Activate admin/cliente depending on needs
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
