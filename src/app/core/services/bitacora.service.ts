import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BitacoraEntry } from '../models';
import { ApiService } from './api.service';

export interface BitacoraResponse {
  logs: BitacoraEntry[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
  };
}

@Injectable({ providedIn: 'root' })
export class BitacoraService {
  private readonly http = inject(HttpClient);
  private readonly apiService = inject(ApiService);
  private readonly apiUrl = `${environment.apiUrl}/admin/bitacora`;

  getLogs(params: any): Observable<BitacoraResponse> {
    // Construimos el query string manualmente para asegurar el formato
    let query = '?';
    Object.keys(params).forEach((key, index) => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        query += `${index > 0 ? '&' : ''}${key}=${params[key]}`;
      }
    });
    
    // Usamos el ApiService que ya funciona en otros módulos
    return this.apiService.get<BitacoraResponse>(`admin/bitacora${query.length > 1 ? query : ''}`);
  }

  exportarCSV(fecha_desde?: string, fecha_hasta?: string): Observable<Blob> {
    let httpParams = new HttpParams();
    if (fecha_desde) httpParams = httpParams.append('fecha_desde', fecha_desde);
    if (fecha_hasta) httpParams = httpParams.append('fecha_hasta', fecha_hasta);

    // Para blobs seguimos usando http directamente pero con la URL base correcta
    return this.http.get(`${this.apiUrl}/exportar`, {
      params: httpParams,
      responseType: 'blob'
    });
  }
}
