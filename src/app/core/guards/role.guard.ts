import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, _state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const allowedRoles: string[] = route.data?.['roles'] ?? [];

  if (!auth.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const user = auth.getCurrentUser();
  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  // Obtener el rol del usuario (desde el array de roles)
  let rawRole = '';
  const firstRole = user.roles && user.roles.length > 0 ? user.roles[0] : null;
  
  if (firstRole) {
    if (typeof firstRole === 'string') {
      rawRole = firstRole;
    } else {
      rawRole = firstRole.nombre || '';
    }
  }

  // Normalizar a los 3 tipos core del sistema
  const lower = rawRole.toLowerCase().trim();
  let normalizedRole = 'cliente';
  if (lower.includes('admin') || lower.includes('administrador')) normalizedRole = 'administrador';
  else if (lower.includes('taller')) normalizedRole = 'taller';

  if (!allowedRoles.includes(normalizedRole)) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
