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
import { passwordMatchValidator } from '../../validators/passwordMatch.validator';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-register-form',
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
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.scss'
})
export class RegisterFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastNotificationService);

  readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmarPassword: ['', [Validators.required]]
  }, { validators: passwordMatchValidator });

  readonly loading = signal(false);
  readonly hidePassword = signal(true);
  readonly hideConfirmPassword = signal(true);

  get nombreCtrl(): AbstractControl { return this.form.get('nombre')!; }
  get emailCtrl(): AbstractControl { return this.form.get('email')!; }
  get passwordCtrl(): AbstractControl { return this.form.get('password')!; }
  get confirmarPasswordCtrl(): AbstractControl { return this.form.get('confirmarPassword')!; }

  getNombreError(): string {
    if (this.nombreCtrl.hasError('required')) return 'El nombre es requerido';
    return this.nombreCtrl.hasError('minlength') ? 'Mínimo 3 caracteres' : '';
  }

  getEmailError(): string {
    if (this.emailCtrl.hasError('required')) return 'El email es requerido';
    return this.emailCtrl.hasError('email') ? 'Email no válido' : '';
  }

  getPasswordError(): string {
    if (this.passwordCtrl.hasError('required')) return 'La contraseña es requerida';
    return this.passwordCtrl.hasError('minlength') ? 'Mínimo 6 caracteres' : '';
  }

  getConfirmarPasswordError(): string {
    if (this.confirmarPasswordCtrl.hasError('required')) return 'Confirma tu contraseña';
    return this.form.hasError('passwordMismatch') ? 'Las contraseñas no coinciden' : '';
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update(v => !v);
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { nombre, email, password, confirmarPassword } = this.form.getRawValue();

    this.authService.register(nombre!, email!, password!, confirmarPassword!).subscribe({
      next: () => {
        this.toast.success('Registro exitoso. Inicia sesión');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.toast.error(error.error?.message || 'Error al registrar usuario');
        this.loading.set(false);
      },
      complete: () => {
        this.loading.set(false);
      }
    });
  }
}
