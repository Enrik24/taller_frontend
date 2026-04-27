import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

import { StorageService } from './storage.service';
import { Usuario, Rol } from '../models/index';
import { environment } from '../../../environments/environment';

interface JwtPayload {
  sub?: string | number;
  user_id?: number;
  id?: number;
  nombre?: string;
  email?: string;
  rol?: string;
  roles?: string[];
  exp?: number;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);

  private readonly TOKEN_KEY = 'access_token';
  private readonly ROL_KEY = 'user_rol';
  private readonly NOMBRE_KEY = 'user_nombre';
  private readonly apiUrl = environment.apiUrl;

  // ── Autenticación ────────────────────────────────────────────────────────────

  login(email: string, password: string): Observable<any> {
    const body = new HttpParams()
      .set('username', email)
      .set('password', password);

    return this.http
      .post<{ access_token: string; refresh?: string; token_type: string; rol?: string; nombre?: string }>(
        `${this.apiUrl}/auth/login`,
        body
      )
      .pipe(
        tap((res) => {
          if (res?.access_token) {
            this.storage.setItem(this.TOKEN_KEY, res.access_token);
            if (res.refresh) {
              this.storage.setItem('refresh_token', res.refresh);
            }
            // Guardar rol y nombre del cuerpo de la respuesta del backend
            if (res.rol) {
              this.storage.setItem(this.ROL_KEY, res.rol);
            }
            if (res.nombre) {
              this.storage.setItem(this.NOMBRE_KEY, res.nombre);
            }
          }
        }),
      );
  }

  register(
    nombre: string,
    email: string,
    password: string,
    confirmarPassword: string,
  ): Observable<any> {
    const body = {
      nombre,
      email,
      password,
      confirmar_password: confirmarPassword,
      tipo: 'taller'
    };

    return this.http.post(`${this.apiUrl}/register/web`, body);
  }

  logout(): void {
    this.storage.clear();
    this.router.navigate(['/login']);
  }

  // ── Estado de sesión ─────────────────────────────────────────────────────────

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const now = Math.floor(Date.now() / 1000);
      return decoded.exp ? decoded.exp > now : true;
    } catch {
      return false;
    }
  }

  getCurrentUser(): Usuario | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode<JwtPayload>(token);

      // Fuente primaria: datos guardados del body de la respuesta del login
      // Fallback: datos que podrían estar dentro del JWT
      const savedRol = this.storage.getItem<string>(this.ROL_KEY);
      const savedNombre = this.storage.getItem<string>(this.NOMBRE_KEY);

      const nombre = savedNombre || decoded.nombre || '';
      const rolStr = savedRol || decoded.rol || '';

      return {
        id: decoded.user_id ?? decoded.id ?? Number(decoded.sub) ?? 0,
        nombre,
        email: decoded.email ?? decoded.sub?.toString() ?? '',
        fecha_registro: '',
        activo: true,
        roles: rolStr
          ? [{ id: 0, nombre: rolStr } as Rol]
          : [],
      } as Usuario;
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return this.storage.getItem<string>(this.TOKEN_KEY);
  }
}
