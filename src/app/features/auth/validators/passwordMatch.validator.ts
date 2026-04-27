import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmarPassword = control.get('confirmarPassword');

  if (password && confirmarPassword && password.value !== confirmarPassword.value) {
    return { passwordMismatch: true };
  }
  return null;
};
