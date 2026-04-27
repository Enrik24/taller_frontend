import { Component, ChangeDetectionStrategy, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <mat-toolbar class="app-topbar">
      <!-- Lado izquierdo -->
      <div class="left-section">
        <button mat-icon-button (click)="toggleSidebar.emit()" aria-label="Toggle Sidebar">
          <mat-icon>menu</mat-icon>
        </button>
      </div>

      <!-- Lado derecho -->
      <div class="right-section">
        <button mat-icon-button [matMenuTriggerFor]="userMenu" class="avatar-button" aria-label="User Menu">
          <div class="avatar-circle">
            {{ getInitials() }}
          </div>
        </button>

        <mat-menu #userMenu="matMenu" xPosition="before" class="user-menu">
          <div class="user-info">
            <span class="user-email">{{ authService.getCurrentUser()?.email || 'usuario@example.com' }}</span>
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
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .app-topbar {
      height: 64px;
      background-color: #ffffff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.08);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 100; /* Z-index menor que 1000 para no aplastar el .cdk-overlay-container del menú */
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 16px;
    }

    .left-section, .right-section {
      display: flex;
      align-items: center;
    }

    /* Custom Avatar implementation to use initials without depending strictly on undocumented text logic inside mat-avatar */
    .avatar-button {
      width: 40px;
      height: 40px;
      padding: 0;
      border-radius: 50%;
      background-color: #3f51b5; /* Primary or custom color */
      color: white;
      overflow: hidden;
    }

    .avatar-circle {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: 600;
      font-size: 14px;
      text-transform: uppercase;
    }

    ::ng-deep .user-menu .mat-mdc-menu-content {
      padding-top: 0;
    }

    .user-info {
      padding: 16px;
      background-color: #f5f5f5;
    }

    .user-email {
      color: #757575;
      font-size: 14px;
    }
  `]
})
export class TopbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  authService = inject(AuthService);

  getInitials(): string {
    const user = this.authService.getCurrentUser();
    if (!user || (!user.nombre && !user.email)) {
      return 'US';
    }
    
    // Si tiene nombre "María García", tomamos "MG"
    if (user.nombre) {
      const parts = user.nombre.trim().split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].substring(0, 2).toUpperCase();
    }
    
    // Fallback al inicio del email
    return user.email.substring(0, 2).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}
