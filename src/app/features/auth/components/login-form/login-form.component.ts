import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../../../core/services/auth.service';
import { ToastNotificationService } from '../../../../shared/components/toast-notification/toast-notification.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    ButtonComponent
  ],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss'
})
export class LoginFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastNotificationService);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  readonly loading = signal(false);
  readonly hidePassword = signal(true);

  get emailCtrl(): AbstractControl {
    return this.form.get('email')!;
  }

  get passwordCtrl(): AbstractControl {
    return this.form.get('password')!;
  }

  getEmailError(): string {
    if (this.emailCtrl.hasError('required')) {
      return 'El email es requerido';
    }
    return this.emailCtrl.hasError('email') ? 'Email no válido' : '';
  }

  getPasswordError(): string {
    if (this.passwordCtrl.hasError('required')) {
      return 'La contraseña es requerida';
    }
    return this.passwordCtrl.hasError('minlength') ? 'Mínimo 6 caracteres' : '';
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update((val) => !val);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { email, password } = this.form.getRawValue();

    this.authService.login(email, password).subscribe({
      next: (res) => {
        const user = this.authService.getCurrentUser();
        const role = user?.roles?.[0]?.nombre?.toLowerCase() || '';

        this.toast.success('Inicio de sesión exitoso');

        if (role.includes('admin')) {
          this.router.navigate(['/dashboard']);
        } else if (role.includes('taller')) {
          this.router.navigate(['/solicitudes-disponibles']);
        } else if (role.includes('cliente')) {
          this.router.navigate(['/reportar-emergencia']);
        } else {
          this.router.navigate(['/']); // Fallback
        }
      },
      error: (error) => {
        this.toast.error(error.error?.message || 'Error al iniciar sesión');
        this.loading.set(false);
      },
      complete: () => {
        this.loading.set(false);
      }
    });
  }
}
