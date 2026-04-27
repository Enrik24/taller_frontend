import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Angular Material
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Components
import { SolicitudCardComponent } from '../components/solicitud-card/solicitud-card.component';

// Services and Models
import { ApiService } from '../../../core/services/api.service';
import { Solicitud } from '../../../core/models';

@Component({
  selector: 'app-mis-solicitudes',
  standalone: true,
  imports: [
    CommonModule, 
    MatTabsModule,
    MatProgressSpinnerModule,
    SolicitudCardComponent
  ],
  template: `
    <div class="mis-solicitudes-container w-full max-w-5xl mx-auto p-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-3xl font-bold text-gray-800 m-0">Mis Solicitudes</h2>
          <p class="text-gray-500 mt-1">Historial y estado de tus emergencias reportadas.</p>
        </div>
      </div>

      @if (loading()) {
        <div class="flex flex-col justify-center items-center py-20">
          <mat-spinner diameter="40"></mat-spinner>
          <p class="mt-4 text-gray-500">Cargando tus solicitudes...</p>
        </div>
      } @else {
        <mat-tab-group class="custom-tabs bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100" mat-stretch-tabs="false" mat-align-tabs="start">
          
          <mat-tab label="Todas ({{ solicitudes().length }})">
            <ng-template matTabContent>
              <div class="p-6">
                @if (solicitudes().length === 0) {
                  <div class="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p class="text-gray-500">No tienes ninguna solicitud registrada.</p>
                  </div>
                } @else {
                  <div class="flex flex-col gap-4">
                    @for (solicitud of solicitudes(); track solicitud.id) {
                      <app-solicitud-card [solicitud]="solicitud" (verDetalle)="verDetalle($event)"></app-solicitud-card>
                    }
                  </div>
                }
              </div>
            </ng-template>
          </mat-tab>
          
          <mat-tab label="Pendientes ({{ pendientes().length }})">
            <ng-template matTabContent>
              <div class="p-6">
                @if (pendientes().length === 0) {
                  <div class="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p class="text-gray-500">No hay solicitudes pendientes.</p>
                  </div>
                } @else {
                  <div class="flex flex-col gap-4">
                    @for (solicitud of pendientes(); track solicitud.id) {
                      <app-solicitud-card [solicitud]="solicitud" (verDetalle)="verDetalle($event)"></app-solicitud-card>
                    }
                  </div>
                }
              </div>
            </ng-template>
          </mat-tab>
          
          <mat-tab label="En Proceso ({{ enProceso().length }})">
            <ng-template matTabContent>
              <div class="p-6">
                @if (enProceso().length === 0) {
                  <div class="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p class="text-gray-500">No hay solicitudes en proceso actualmente.</p>
                  </div>
                } @else {
                  <div class="flex flex-col gap-4">
                    @for (solicitud of enProceso(); track solicitud.id) {
                      <app-solicitud-card [solicitud]="solicitud" (verDetalle)="verDetalle($event)"></app-solicitud-card>
                    }
                  </div>
                }
              </div>
            </ng-template>
          </mat-tab>
          
          <mat-tab label="Atendidas ({{ atendidas().length }})">
            <ng-template matTabContent>
              <div class="p-6">
                @if (atendidas().length === 0) {
                  <div class="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p class="text-gray-500">Aún no hay solicitudes finalizadas o atendidas.</p>
                  </div>
                } @else {
                  <div class="flex flex-col gap-4">
                    @for (solicitud of atendidas(); track solicitud.id) {
                      <app-solicitud-card [solicitud]="solicitud" (verDetalle)="verDetalle($event)"></app-solicitud-card>
                    }
                  </div>
                }
              </div>
            </ng-template>
          </mat-tab>

        </mat-tab-group>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: #f9fafb;
    }
  `]
})
export class MisSolicitudesComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);

  solicitudes = signal<Solicitud[]>([]);
  loading = signal<boolean>(true);
  
  // Computed values
  pendientes = computed(() => this.solicitudes().filter(s => s.estado === 'Pendiente'));
  enProceso = computed(() => this.solicitudes().filter(s => s.estado === 'En proceso'));
  atendidas = computed(() => this.solicitudes().filter(s => s.estado === 'Atendido'));

  ngOnInit() {
    this.loadSolicitudes();
  }

  loadSolicitudes() {
    this.loading.set(true);
    this.apiService.get<Solicitud[]>('solicitudes/mis-solicitudes').subscribe({
      next: (data) => {
        this.solicitudes.set(data || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando solicitudes:', err);
        this.loading.set(false);
      }
    });
  }

  verDetalle(id: number) {
    this.router.navigate(['/emergencias/solicitudes', id]);
  }
}
