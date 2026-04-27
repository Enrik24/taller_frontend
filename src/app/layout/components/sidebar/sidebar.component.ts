import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-sidenav 
      #sidenav
      [mode]="isMobile() ? 'over' : 'side'" 
      [opened]="opened"
      (closed)="closed.emit()"
      class="app-sidenav">
      
      <div class="sidenav-header">
        <div class="logo-placeholder">
          <mat-icon>local_hospital</mat-icon>
          <span>Emergencias Vehiculares</span>
        </div>
        @if (isMobile()) {
          <button mat-icon-button (click)="closed.emit()" class="close-btn">
            <mat-icon>close</mat-icon>
          </button>
        }
      </div>

      <mat-nav-list>

        <!-- Gestión de Usuario -->
        @if (isAdmin()) {
          <mat-accordion>
            <mat-expansion-panel class="mat-elevation-z0">
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <mat-icon>folder</mat-icon>
                  <span>Gestión de Usuario</span>
                </mat-panel-title>
              </mat-expansion-panel-header>
              <mat-nav-list class="sub-list">
                <a mat-list-item routerLink="/usuarios" routerLinkActive="active-link" (click)="closeIfMobile()">
                  <mat-icon>group</mat-icon> <span matListItemTitle>Gestionar Usuarios</span>
                </a>
                <a mat-list-item routerLink="/roles" routerLinkActive="active-link" (click)="closeIfMobile()">
                  <mat-icon>security</mat-icon> <span matListItemTitle>Roles</span>
                </a>
                <a mat-list-item routerLink="/permisos" routerLinkActive="active-link" (click)="closeIfMobile()">
                  <mat-icon>vpn_key</mat-icon> <span matListItemTitle>Permisos</span>
                </a>
                <a mat-list-item routerLink="/bitacora" routerLinkActive="active-link" (click)="closeIfMobile()">
                  <mat-icon>list_alt</mat-icon> <span matListItemTitle>Gestionar Bitácora del Sistema</span>
                </a>
                <a mat-list-item routerLink="/notificaciones" routerLinkActive="active-link" (click)="closeIfMobile()">
                  <mat-icon>notifications</mat-icon> <span matListItemTitle>Gestionar Notificaciones Push</span>
                </a>
              </mat-nav-list>
            </mat-expansion-panel>
          </mat-accordion>
        }



        <!-- Gestión de Servicios (Taller) -->
        @if (isTaller() || isAdmin()) {
          <mat-accordion>
            <mat-expansion-panel class="mat-elevation-z0">
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <mat-icon>folder</mat-icon>
                  <span>Gestión de Servicios (Taller)</span>
                </mat-panel-title>
              </mat-expansion-panel-header>
              <mat-nav-list class="sub-list">
                <a mat-list-item routerLink="/consultar-info-ia" routerLinkActive="active-link" (click)="closeIfMobile()">
                  <mat-icon>smart_toy</mat-icon> <span matListItemTitle>Consultar Información Enriquecida</span>
                </a>
                @if (isAdmin()) {
                  <a mat-list-item routerLink="/gestion-talleres" routerLinkActive="active-link" (click)="closeIfMobile()">
                    <mat-icon>store</mat-icon> <span matListItemTitle>Gestión de Talleres</span>
                  </a>
                  <a mat-list-item routerLink="/gestion-clientes" routerLinkActive="active-link" (click)="closeIfMobile()">
                    <mat-icon>people</mat-icon> <span matListItemTitle>Gestión de Clientes</span>
                  </a>
                }
                <a mat-list-item routerLink="/solicitudes-disponibles" routerLinkActive="active-link" (click)="closeIfMobile()">
                  <mat-icon>inbox</mat-icon> <span matListItemTitle>Visualizar Solicitudes Disponibles</span>
                </a>
                <a mat-list-item routerLink="/historial-atenciones" routerLinkActive="active-link" (click)="closeIfMobile()">
                  <mat-icon>history</mat-icon> <span matListItemTitle>Ver Historial de Atenciones</span>
                </a>
              </mat-nav-list>
            </mat-expansion-panel>
          </mat-accordion>
        }

        <!-- Transacciones y Trazabilidad -->
        <mat-accordion>
          <mat-expansion-panel class="mat-elevation-z0">
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon>folder</mat-icon>
                <span>Transacciones y Trazabilidad</span>
              </mat-panel-title>
            </mat-expansion-panel-header>
            <mat-nav-list class="sub-list">
              <a mat-list-item routerLink="/procesar-evidencias" routerLinkActive="active-link" (click)="closeIfMobile()">
                <mat-icon>psychology</mat-icon> <span matListItemTitle>Procesar Evidencias con IA</span>
              </a>

              <a mat-list-item routerLink="/asignacion-inteligente" routerLinkActive="active-link" (click)="closeIfMobile()">
                <mat-icon>ads_click</mat-icon> <span matListItemTitle>Asignar Taller Inteligentemente</span>
              </a>
            </mat-nav-list>
          </mat-expansion-panel>
        </mat-accordion>

      </mat-nav-list>
    </mat-sidenav>
  `,
  styles: [`
    .app-sidenav {
      width: 260px;
      background-color: #1a237e; /* Using indigo 900 as dark primary for example */
      color: white;
    }

    ::ng-deep .app-sidenav .mat-expansion-panel {
      background: transparent !important;
      color: white !important;
    }

    ::ng-deep .app-sidenav .mat-expansion-panel-header-title {
      color: white !important;
      align-items: center;
      gap: 12px;
    }
    
    ::ng-deep .app-sidenav .mat-expansion-indicator::after {
      color: white !important;
    }

    .sidenav-header {
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logo-placeholder {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 600;
      font-size: 16px;
    }

    .sub-list a {
      color: rgba(255, 255, 255, 0.8) !important;
    }

    .sub-list a:hover, .sub-list a.active-link {
      color: white !important;
      background-color: rgba(255, 255, 255, 0.1) !important;
    }
    
    .sub-list .mat-icon {
      color: rgba(255, 255, 255, 0.8) !important;
      margin-right: 12px;
    }

    .close-btn {
      color: white;
    }
  `]
})
export class SidebarComponent {
  @Input() opened = false;
  @Output() closed = new EventEmitter<void>();

  private authService = inject(AuthService);
  private breakpointObserver = inject(BreakpointObserver);

  // Responsive signals
  isMobile = toSignal(
    this.breakpointObserver.observe([Breakpoints.Handset]).pipe(
      map(result => result.matches)
    ),
    { initialValue: false }
  );

  // Rol evaluation signals (using standard angular computed/signal wouldn't auto-update if token isn't in signal, 
  // but for basic usage getting the user info is fine).
  get user() { return this.authService.getCurrentUser(); }

  // Consider real roles: 'admin', 'cliente', 'taller' (Depends on DB values)
  isAdmin() { return this.user?.roles?.[0]?.nombre?.toLowerCase().includes('administrador'); }
  isCliente() { return this.user?.roles?.[0]?.nombre?.toLowerCase() === 'cliente'; }
  isTaller() { return this.user?.roles?.[0]?.nombre?.toLowerCase() === 'taller'; }

  closeIfMobile() {
    if (this.isMobile()) {
      this.closed.emit();
    }
  }
}
