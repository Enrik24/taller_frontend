import { inject, Injectable } from '@angular/core';
import { PlatformLocation } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class StorageService {
  // PlatformLocation inyectado para compatibilidad SSR futura
  private readonly _platformLocation = inject(PlatformLocation);

  setItem(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('[StorageService] setItem error', e);
    }
  }

  getItem<T = any>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (e) {
      console.error('[StorageService] getItem error', e);
      return null;
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }
}
