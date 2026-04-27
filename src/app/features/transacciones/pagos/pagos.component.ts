import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentBannerComponent } from '../components/payment-banner/payment-banner.component';
import { PaymentFormComponent } from '../components/payment-form/payment-form.component';
import { ApiService } from '../../../core/services/api.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [
    CommonModule,
    PaymentBannerComponent,
    PaymentFormComponent,
    MatProgressSpinnerModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="pagos-container">
      <h1 class="page-title">Realizar Pago</h1>

      <ng-container *ngIf="loading()">
        <div class="loading-state">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Cargando información del pago...</p>
        </div>
      </ng-container>

      <ng-container *ngIf="!loading() && !success() && error()">
        <mat-card class="error-card">
          <mat-icon color="warn">error_outline</mat-icon>
          <p>{{ error() }}</p>
          <button mat-button (click)="goBack()">Volver</button>
        </mat-card>
      </ng-container>

      <ng-container *ngIf="!loading() && !success() && !error()">
        <app-payment-banner></app-payment-banner>
        
        <mat-card class="resumen-card">
          <mat-card-header>
            <mat-icon mat-card-avatar color="primary">receipt</mat-icon>
            <mat-card-title>Resumen de Solicitud</mat-card-title>
            <mat-card-subtitle>ID: {{ solicitudId() }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p [class.text-muted]="!descripcion()">
              {{ descripcion() || 'Sin descripción disponible' }}
            </p>
          </mat-card-content>
        </mat-card>

        <app-payment-form
          [solicitudId]="solicitudId()"
          [montoTotal]="montoTotal()"
          (pagoCompletado)="onPagoCompletado()"
        ></app-payment-form>
      </ng-container>

      <ng-container *ngIf="success()">
        <mat-card class="success-card">
          <mat-icon class="success-icon">check_circle</mat-icon>
          <h2>¡Pago Completado!</h2>
          <p>Tu pago por \${{ montoTotal() | number:'1.2-2' }} se ha procesado exitosamente.</p>
          <button mat-flat-button color="primary" (click)="goHome()">
            Volver al Inicio
          </button>
        </mat-card>
      </ng-container>
    </div>
  `,
  styles: `
    .pagos-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 24px;
    }
    .page-title {
      font-size: 28px;
      font-weight: 700;
      color: #333;
      margin-bottom: 24px;
      text-align: center;
    }
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 0;
      gap: 16px;
      color: #666;
    }
    .resumen-card {
      margin-bottom: 16px;
    }
    .error-card, .success-card {
      text-align: center;
      padding: 32px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    .text-muted {
      color: #999;
      font-style: italic;
    }
    .success-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #4caf50;
      margin-bottom: 16px;
    }
  `
})
export class PagosComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);

  solicitudId = signal<number>(0);
  montoTotal = signal<number>(0);
  descripcion = signal<string>('');
  
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  success = signal<boolean>(false);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const id = params['id'] || this.route.snapshot.paramMap.get('id');
      if (id) {
        this.solicitudId.set(Number(id));
        this.fetchDetallesSolicitud(this.solicitudId());
      } else {
        this.error.set('No se proporcionó un ID de solicitud válido.');
        this.loading.set(false);
      }
    });
  }

  async fetchDetallesSolicitud(id: number) {
    try {
      this.loading.set(true);
      const r = await firstValueFrom(this.apiService.get<any>(`solicitudes/${id}/pago-info`));
      this.montoTotal.set(r.monto_total || 0);
      this.descripcion.set(r.descripcion || '');
    } catch(e) {
      console.error('Error fetching payment info:', e);
      this.error.set('No se pudo obtener la información del pago. Por favor intente más tarde.');
    } finally {
      this.loading.set(false);
    }
  }

  onPagoCompletado() {
    this.success.set(true);
  }

  goBack() {
    this.router.navigate(['..']);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
