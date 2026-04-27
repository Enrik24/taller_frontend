import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ToastNotificationService {
  private snackBar = inject(MatSnackBar);

  private defaultConfig: MatSnackBarConfig = {
    horizontalPosition: 'right',
    verticalPosition: 'top',
  };

  success(message: string, duration: number = 3000): void {
    this.snackBar.open(message, '×', {
      ...this.defaultConfig,
      duration,
      panelClass: ['success-snackbar', 'toast-notification']
    });
  }

  error(message: string, duration: number = 5000): void {
    this.snackBar.open(message, '×', {
      ...this.defaultConfig,
      duration,
      panelClass: ['error-snackbar', 'toast-notification']
    });
  }

  warning(message: string, duration: number = 4000): void {
    this.snackBar.open(message, '×', {
      ...this.defaultConfig,
      duration,
      panelClass: ['warning-snackbar', 'toast-notification']
    });
  }

  info(message: string, duration: number = 3000): void {
    this.snackBar.open(message, '×', {
      ...this.defaultConfig,
      duration,
      panelClass: ['info-snackbar', 'toast-notification']
    });
  }
}
