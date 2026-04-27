import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-payment-banner',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card class="banner-pago">
      <div class="info-usuario">
        <mat-icon>account_circle</mat-icon>
        <div>
          <p class="label">Pagando como:</p>
          <p class="email">{{ auth.getCurrentUser()?.email }}</p>
        </div>
      </div>
    </mat-card>
  `,
  styles: `
    .banner-pago {
      background-color: #e3f2fd;
      border-left: 6px solid #1976d2;
      padding: 16px;
      margin-bottom: 24px;
      border-radius: 8px;
    }
    .info-usuario {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #1976d2;
    }
    .label {
      margin: 0;
      font-size: 14px;
      color: #555;
    }
    .email {
      margin: 0;
      font-weight: bold;
      font-size: 16px;
      color: #333;
    }
  `
})
export class PaymentBannerComponent {
  auth = inject(AuthService);
}
