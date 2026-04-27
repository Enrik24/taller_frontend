import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
} from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

interface NavCategory {
  title: string;
  icon: string;
  roles?: string[];
  items: NavItem[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,

  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <!-- Sidebar -->
      <mat-sidenav 
        [mode]="isMobile() ? 'over' : 'side'" 
        [opened]="!isMobile()" 
        class="sidenav"
        #sidenav>
        <div class="sidenav-header">
          <mat-icon class="brand-icon">car_repair</mat-icon>
          <span class="brand-name">EmergVeh</span>
          @if(isMobile()) {
            <button mat-icon-button (click)="sidenav.close()" class="close-btn" style="margin-left: auto;">
              <mat-icon>close</mat-icon>
            </button>
          }
        </div>

        <div class="main-nav-list">
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active-link" (click)="isMobile() ? sidenav.close() : null">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span>Dashboard Principal</span>
          </a>

          @for (category of filteredCategories(); track category.title) {
            <div class="nav-category">
              <div class="category-header" (click)="toggleCategory(category.title)">
                <mat-icon class="category-icon">{{ category.icon }}</mat-icon>
                <span class="category-label">{{ category.title }}</span>
                <mat-icon class="expand-icon">{{ expandedCategories()[category.title] ? 'expand_less' : 'expand_more' }}</mat-icon>
              </div>
              
              @if(expandedCategories()[category.title]) {
                <div class="sub-nav-list">
                  @for (item of category.items; track item.route) {
                    <a class="sub-nav-item"
                       [routerLink]="item.route"
                       routerLinkActive="active-link"
                       (click)="isMobile() ? sidenav.close() : null">
                      <mat-icon>{{ item.icon }}</mat-icon>
                      <span>{{ item.label }}</span>
                    </a>
                  }
                </div>
              }
            </div>
          }
        </div>

        <div class="sidenav-footer">
          <button mat-icon-button (click)="logout()" matTooltip="Cerrar sesión">
            <mat-icon>logout</mat-icon>
          </button>
        </div>
      </mat-sidenav>

      <!-- Main content -->
      <mat-sidenav-content class="main-content">
        <mat-toolbar class="top-toolbar">
          @if(isMobile()) {
            <button mat-icon-button (click)="sidenav.open()" style="margin-right: 8px;">
              <mat-icon>menu</mat-icon>
            </button>
          }
          <span class="toolbar-title">Plataforma de Emergencias</span>
          <span class="flex-spacer"></span>
          <span class="user-info">{{ currentUser()?.nombre ?? 'Usuario' }}</span>
          
          <button mat-icon-button [matMenuTriggerFor]="userMenu" class="avatar-dropdown">
            <mat-icon class="user-avatar">account_circle</mat-icon>
          </button>
          
          <mat-menu #userMenu="matMenu" xPosition="before">
            <div class="user-menu-header">
              <span class="user-email">{{ currentUser()?.email || 'usuario@example.com' }}</span>
            </div>
            <mat-divider></mat-divider>
            <a mat-menu-item routerLink="/perfil">
              <mat-icon>person</mat-icon>
              <span>Perfil</span>
            </a>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Cerrar Sesión</span>
            </button>
          </mat-menu>
          
        </mat-toolbar>

        <div class="page-container">
          <router-outlet />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container { height: 100vh; background: #f4f6f8; }

    .sidenav {
      width: 270px;
      background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
      border-right: 1px solid rgba(0,0,0,0.06);
      display: flex; flex-direction: column;
      overflow-y: auto;
    }

    .sidenav-header {
      display: flex; align-items: center; gap: 12px;
      padding: 24px 20px 16px;
      border-bottom: 1px solid rgba(0,0,0,0.06);
    }
    .brand-icon { color: #6c63ff; font-size: 28px; width: 28px; height: 28px; }
    .brand-name { font-size: 1.2rem; font-weight: 700; color: #333; letter-spacing: 0.5px; }

    .main-nav-list { flex: 1; padding: 8px 0; overflow-y: auto; }

    a[mat-list-item] { color: rgba(0,0,0,0.65); border-radius: 8px; margin: 2px 8px; }
    a[mat-list-item]:hover { background: rgba(108,99,255,0.08); color: #000; }
    .active-link { background: rgba(108,99,255,0.15) !important; color: #6c63ff !important; font-weight: 500; }

    .nav-category { margin: 4px 0; }
    .category-header {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 16px; margin: 0 8px;
      border-radius: 8px; cursor: pointer;
      font-size: 12px; font-weight: 600; color: rgba(0,0,0,0.5);
      text-transform: uppercase; letter-spacing: 0.5px;
      transition: background 0.15s;
    }
    .category-header:hover { background: rgba(108,99,255,0.05); }
    .category-icon { font-size: 20px; width: 20px; height: 20px; color: rgba(0,0,0,0.4); }
    .category-label { flex: 1; }
    .expand-icon { font-size: 18px; width: 18px; height: 18px; color: rgba(0,0,0,0.3); }

    .sub-nav-list { padding: 2px 0 8px 0; }
    .sub-nav-item {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 16px 8px 28px; margin: 1px 8px 1px 20px;
      border-radius: 0 8px 8px 0; border-left: 2px solid rgba(108,99,255,0.15);
      color: rgba(0,0,0,0.6); font-size: 13px;
      text-decoration: none; cursor: pointer;
      transition: all 0.15s;
    }
    .sub-nav-item:hover { background: rgba(108,99,255,0.06); color: #333; }
    .sub-nav-item.active-link { background: rgba(108,99,255,0.12); color: #6c63ff; border-left-color: #6c63ff; font-weight: 500; }
    .sub-nav-item mat-icon { font-size: 18px; width: 18px; height: 18px; }

    .sidenav-footer {
      padding: 12px; border-top: 1px solid rgba(0,0,0,0.06);
      display: flex; justify-content: center;
    }
    .sidenav-footer button { color: rgba(0,0,0,0.5); }
    .sidenav-footer button:hover { color: #ff5c5c; }

    .top-toolbar {
      background: rgba(255,255,255,0.95);
      border-bottom: 1px solid rgba(0,0,0,0.06);
      backdrop-filter: blur(8px);
      color: #333;
      position: sticky; top: 0; z-index: 10;
    }
    .toolbar-title { font-size: 0.95rem; font-weight: 500; color: rgba(0,0,0,0.7); }
    .flex-spacer { flex: 1; }
    .user-info { font-size: 0.875rem; margin-right: 8px; color: rgba(0,0,0,0.8); }
    .user-avatar { color: #6c63ff; font-size: 28px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; }
    .avatar-dropdown { overflow: visible; }
    
    .user-menu-header { padding: 16px; background-color: #f5f5f5; }
    .user-email { color: #757575; font-size: 14px; }

    .main-content { background: #f4f6f8; }
    .page-container { padding: 28px 32px; min-height: calc(100vh - 64px); }

    @media (max-width: 960px) {
      .page-container { padding: 16px; }
      .user-info { display: none; }
    }
  `],
})
export class MainLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly currentUser = signal(this.auth.getCurrentUser());

  expandedCategories = signal<Record<string, boolean>>({});

  toggleCategory(title: string): void {
    this.expandedCategories.update(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  }

  isMobile = toSignal(
    this.breakpointObserver.observe(['(max-width: 960px)']).pipe(
      map(result => result.matches)
    ),
    { initialValue: false }
  );

  readonly menuCategories: NavCategory[] = [
    {
      title: 'Gestión de Usuario',
      icon: 'folder_shared',
      roles: ['administrador'],
      items: [
        { label: 'Gestionar Usuarios', icon: 'people', route: '/usuarios' },
        { label: 'Roles', icon: 'security', route: '/roles' },
        { label: 'Permisos', icon: 'vpn_key', route: '/permisos' },
        { label: 'Gestionar Bitácora del Sistema', icon: 'list_alt', route: '/bitacora' },
        { label: 'Gestionar Notificaciones Push', icon: 'notifications', route: '/notificaciones' }
      ]
    },
    {
      title: 'Gestión de Servicios (Taller)',
      icon: 'build_circle',
      roles: ['taller', 'administrador'],
      items: [
        { label: 'Consultar Información Enriquecida', icon: 'smart_toy', route: '/consultar-info-ia' },
        { label: 'Gestión de Talleres', icon: 'store', route: '/gestion-talleres', roles: ['administrador'] },
        { label: 'Gestión de Clientes', icon: 'people', route: '/gestion-clientes', roles: ['administrador'] },
        { label: 'Visualizar Solicitudes Disponibles', icon: 'inbox', route: '/solicitudes-disponibles' },
        { label: 'Ver Historial de Atenciones', icon: 'history', route: '/historial-atenciones' }
      ]
    },
    {
      title: 'Transacciones y Trazabilidad',
      icon: 'account_balance_wallet',
      items: [
        { label: 'Procesar Evidencias con IA', icon: 'psychology', route: '/procesar-evidencias' },
        { label: 'Asignar Taller Inteligentemente', icon: 'ads_click', route: '/asignacion-inteligente' }
      ]
    }
  ];

  filteredCategories = computed(() => {
    const user = this.currentUser();
    let userRole = 'cliente';
    
    if (user?.roles && user.roles.length > 0) {
      const firstRole = user.roles[0];
      if (typeof firstRole === 'string') userRole = firstRole;
      else if (firstRole.nombre) userRole = firstRole.nombre;
    }
    
    // Normalizar a los 3 tipos core evaluando substrings
    const roleStr = userRole.toLowerCase().trim();
    if (roleStr.includes('admin') || roleStr.includes('administrador')) {
      userRole = 'administrador';
    } else if (roleStr.includes('taller')) {
      userRole = 'taller';
    } else {
      userRole = 'cliente';
    }

    // Filtramos categorías y subitems
    const result: NavCategory[] = [];
    
    for (const cat of this.menuCategories) {
      // Si la categoría tiene restricción de rol global
      if (cat.roles && !cat.roles.includes(userRole)) {
        continue;
      }
      
      // Filtramos los items internos
      const allowedItems = cat.items.filter(item => {
        if (!item.roles || item.roles.length === 0) return true;
        return item.roles.includes(userRole);
      });

      // Si quedan items, se añade la categoría entera
      if (allowedItems.length > 0) {
        result.push({ ...cat, items: allowedItems });
      }
    }
    
    return result;
  });

  logout(): void {
    this.auth.logout();
  }
}
