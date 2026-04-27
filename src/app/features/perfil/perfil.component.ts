import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { PerfilFormComponent } from './components/perfil-form/perfil-form.component';
import { VehiculosTableComponent } from './components/vehiculos-table/vehiculos-table.component';
import { TecnicosTableComponent } from './components/tecnicos-table/tecnicos-table.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    PerfilFormComponent,
    VehiculosTableComponent,
    TecnicosTableComponent
  ],
  template: `
    <div class="perfil-page">
      <div class="header">
        <h1>Mi Perfil</h1>
        <p>Configura tus datos personales y recursos</p>
      </div>

      <ng-container *ngIf="loading()">
        <div class="loading-state">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Cargando información del perfil...</p>
        </div>
      </ng-container>

      <ng-container *ngIf="!loading()">
        <mat-card class="perfil-card">
          <mat-tab-group animationDuration="0ms">
            <!-- Pestaña 1: Mis Datos -->
            <mat-tab label="Mis Datos">
              <ng-template mat-tab-label>
                <mat-icon class="tab-icon">person</mat-icon>
                Mis Datos
              </ng-template>
              <div class="tab-content">
                <app-perfil-form 
                  [usuario]="usuario()" 
                  [tipoUsuario]="tipoUsuario()"
                  (guardado)="onPerfilGuardado($event)">
                </app-perfil-form>
              </div>
            </mat-tab>

            <!-- Pestaña 2: Vehículos (Cliente o Admin) -->
            <mat-tab *ngIf="tipoUsuario() === 'cliente' || tipoUsuario() === 'administrador'" label="Mis Vehículos">
              <ng-template mat-tab-label>
                <mat-icon class="tab-icon">directions_car</mat-icon>
                Mis Vehículos
              </ng-template>
              <div class="tab-content">
                <app-vehiculos-table 
                  [vehiculos]="vehiculos()" 
                  (cambio)="loadPerfil()">
                </app-vehiculos-table>
              </div>
            </mat-tab>

            <!-- Pestaña 3: Técnicos (Taller o Admin) -->
            <mat-tab *ngIf="tipoUsuario() === 'taller' || tipoUsuario() === 'administrador'" label="Mi Taller">
              <ng-template mat-tab-label>
                <mat-icon class="tab-icon">build</mat-icon>
                Mi Taller (Técnicos)
              </ng-template>
              <div class="tab-content">
                <app-tecnicos-table 
                  [tecnicos]="tecnicos()" 
                  (cambio)="loadPerfil()">
                </app-tecnicos-table>
              </div>
            </mat-tab>

          </mat-tab-group>
        </mat-card>
      </ng-container>
    </div>
  `,
  styles: `
    .perfil-page {
      padding: 24px;
      max-width: 900px;
      margin: 0 auto;
    }
    .header {
      margin-bottom: 32px;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      color: #333;
    }
    .header p {
      margin: 8px 0 0;
      color: #666;
    }
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 48px;
      color: #666;
    }
    .perfil-card {
      border-radius: 8px;
      overflow: hidden;
    }
    .tab-icon {
      margin-right: 8px;
    }
    .tab-content {
      padding: 24px;
    }
  `
})
export class PerfilComponent implements OnInit {
  private authService = inject(AuthService);
  private apiService = inject(ApiService);

  usuario = signal<any>(null);
  tipoUsuario = signal<'cliente' | 'taller' | 'administrador'>('cliente');
  vehiculos = signal<any[]>([]);
  tecnicos = signal<any[]>([]);
  loading = signal<boolean>(true);

  async ngOnInit() {
    this.determinarTipoUsuario();
    await this.loadPerfil();
  }

  determinarTipoUsuario() {
    const userRole = this.authService.getCurrentUser()?.roles?.[0]?.nombre?.toLowerCase() || '';
    if (userRole.includes('taller')) {
      this.tipoUsuario.set('taller');
    } else if (userRole.includes('admin') || userRole.includes('administrador')) {
      this.tipoUsuario.set('administrador');
    } else {
      this.tipoUsuario.set('cliente');
    }
  }

  async loadPerfil() {
    this.loading.set(true);
    try {
      const response = await firstValueFrom(this.apiService.get<any>('perfil'));
      
      // Desempaquetamos si viene envuelto en 'data' (común en este backend)
      const data = response?.data ? response.data : response;
      
      this.usuario.set(data);
      
      if (this.tipoUsuario() === 'cliente' || this.tipoUsuario() === 'administrador') {
        // Asumimos que los vehículos vienen en el perfil, o se manejarán similar luego
        this.vehiculos.set(data.vehiculos || []);
      }
      if (this.tipoUsuario() === 'taller' || this.tipoUsuario() === 'administrador') {
        try {
          const tecnicosResp = await firstValueFrom(this.apiService.get<any>('perfil/tecnicos'));
          const tecnicosArray = tecnicosResp?.data ? tecnicosResp.data : tecnicosResp;
          this.tecnicos.set(Array.isArray(tecnicosArray) ? tecnicosArray : []);
        } catch (err) {
          console.error('Error obteniendo técnicos:', err);
          this.tecnicos.set([]);
        }
      }
    } catch (e) {
      console.error('Error fetching perfil details:', e);
    } finally {
      this.loading.set(false);
    }
  }

  onPerfilGuardado(actualizado: any) {
    // En lugar de confiar en la respuesta del PUT (que puede ser parcial),
    // recargamos el perfil completo para asegurar que la UI se actualice bien.
    this.loadPerfil();
  }
}
