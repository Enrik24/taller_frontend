import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { StorageService } from '../services/storage.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);
  const storage = inject(StorageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'Ha ocurrido un error inesperado.';

      if (error.error) {
        // El backend puede devolver el mensaje en distintas formas
        message =
          error.error?.detail ??
          error.error?.message ??
          error.error?.error ??
          (typeof error.error === 'string' ? error.error : message);
      }

      const isClientOrServerError =
        error.status >= 400 && error.status < 600;

      if (isClientOrServerError) {
        snackBar.open(message, 'Cerrar', {
          duration: 5000,
          panelClass: ['snack-error'],
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        });
      }

      if (error.status === 401 || error.status === 403) {
        storage.clear();
        router.navigate(['/login']);
      }

      return throwError(() => error);
    }),
  );
};
