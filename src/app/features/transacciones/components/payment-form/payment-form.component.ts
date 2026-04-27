import { Component, EventEmitter, Input, Output, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StripeCardComponent, NgxStripeModule, StripeService } from 'ngx-stripe';
import { StripeCardElementOptions, StripeElementsOptions } from '@stripe/stripe-js';
import { ApiService } from '../../../../core/services/api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    NgxStripeModule,
  ],
  template: `
    <mat-card class="payment-card">
      <mat-card-header>
        <mat-card-title>Detalles del Pago</mat-card-title>
        <mat-card-subtitle>Solicitud #{{ solicitudId }}</mat-card-subtitle>
      </mat-card-header>

      <mat-card-content class="form-content">
        <div class="monto-total">
          <span class="label">Total a Pagar:</span>
          <span class="amount">\${{ montoTotal | number:'1.2-2' }}</span>
        </div>

        <div class="stripe-container">
          <ngx-stripe-card
            [options]="cardOptions"
            [elementsOptions]="elementsOptions"
          ></ngx-stripe-card>
        </div>

        <div *ngIf="error()" class="error-message">
          <mat-icon>error</mat-icon>
          <span>{{ error() }}</span>
        </div>
      </mat-card-content>

      <mat-card-actions align="end">
        <button
          mat-flat-button
          color="primary"
          [disabled]="loading()"
          (click)="procesarPago()"
        >
          <mat-spinner *ngIf="loading()" diameter="20" class="spinner"></mat-spinner>
          <mat-icon *ngIf="!loading()">payment</mat-icon>
          {{ loading() ? 'Procesando...' : 'Pagar Ahora' }}
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: `
    .payment-card {
      margin-top: 16px;
    }
    .form-content {
      padding: 24px 16px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .monto-total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }
    .monto-total .label {
      font-size: 16px;
      color: #666;
    }
    .monto-total .amount {
      font-size: 24px;
      font-weight: 700;
      color: #1976d2;
    }
    .stripe-container {
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background-color: #fff;
    }
    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #d32f2f;
      padding: 12px;
      background-color: #ffebee;
      border-radius: 4px;
      font-size: 14px;
    }
    .spinner {
      margin-right: 8px;
      display: inline-block;
    }
  `
})
export class PaymentFormComponent {
  @Input({ required: true }) montoTotal!: number;
  @Input({ required: true }) solicitudId!: number;
  @Output() pagoCompletado = new EventEmitter<void>();

  @ViewChild(StripeCardComponent) card!: StripeCardComponent;

  private apiService = inject(ApiService);
  private stripeService = inject(StripeService);

  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  cardOptions: StripeCardElementOptions = {
    style: {
      base: {
        iconColor: '#666EE8',
        color: '#31325F',
        fontWeight: '300',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSize: '18px',
        '::placeholder': {
          color: '#CFD7E0'
        }
      }
    }
  };

  elementsOptions: StripeElementsOptions = {
    locale: 'es'
  };

  async procesarPago() {
    if (this.loading()) return;
    
    this.loading.set(true);
    this.error.set(null);

    try {
      const clientSecret = await this.createPaymentIntent();
      await this.pagar(clientSecret);
    } catch (e: any) {
      this.error.set(e.message || 'Ocurrió un error al procesar el pago.');
      this.loading.set(false);
    }
  }

  private async createPaymentIntent(): Promise<string> {
    const res = await firstValueFrom(
      this.apiService.post<{ client_secret: string }>('pagos/crear-intencion', {
        solicitud_id: this.solicitudId,
        monto: this.montoTotal
      })
    );
    if (!res.client_secret) {
      throw new Error('No se pudo obtener la intención de pago.');
    }
    return res.client_secret;
  }

  private async pagar(clientSecret: string): Promise<void> {
    const result = await firstValueFrom(
      this.stripeService.confirmCardPayment(clientSecret, {
        payment_method: {
          card: this.card.element,
        }
      })
    );

    if (result.error) {
      throw new Error(result.error.message || 'Error en la tarjeta al pagar.');
    } else if (result.paymentIntent?.status === 'succeeded') {
      this.pagoCompletado.emit();
      this.loading.set(false);
    } else {
      throw new Error('El estado del pago es desconocido.');
    }
  }
}
