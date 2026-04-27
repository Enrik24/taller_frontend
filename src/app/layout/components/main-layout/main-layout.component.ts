import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatSidenavModule, SidebarComponent, TopbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-sidenav-container [hasBackdrop]="true" class="main-container">
      
      <app-sidebar 
        [opened]="sidebarOpened()" 
        (closed)="sidebarOpened.set(false)">
      </app-sidebar>
      
      <mat-sidenav-content>
        <app-topbar (toggleSidebar)="toggleSidebar()"></app-topbar>
        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </mat-sidenav-content>

    </mat-sidenav-container>
  `,
  styles: [`
    .main-container {
      height: 100vh;
    }
  `]
})
export class MainLayoutComponent {
  sidebarOpened = signal(true);

  toggleSidebar(): void {
    this.sidebarOpened.update(opened => !opened);
  }
}
