// ─── Interfaces del dominio – Plataforma de Atención de Emergencias Vehiculares ───

export interface Permiso {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  /** Ejemplos: 'read', 'write', 'delete' */
  accion?: string;
}

export interface Rol {
  id: number;
  nombre: string;
  descripcion?: string;
  permisos?: Permiso[];
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  /** Fecha en formato ISO 8601 */
  fecha_registro: string;
  activo: boolean;
  roles?: Rol[];
}

export interface Tecnico {
  id: number;
  nombre: string;
  especialidad?: string;
  disponible: boolean;
}

export interface Vehiculo {
  id: number;
  marca: string;
  modelo: string;
  anio: number;
  placa: string;
}

export interface Cliente extends Usuario {
  telefono?: string;
  direccion_default?: string;
  vehiculos?: Vehiculo[];
}

export interface Taller extends Usuario {
  nombre_comercial: string;
  direccion: string;
  latitud?: number;
  longitud?: number;
  disponible: boolean;
  calificacion?: number;
  tecnicos?: Tecnico[];
}

export interface Evidencia {
  id: number;
  tipo: 'Imagen' | 'Audio' | 'Texto';
  url_archivo: string;
  fecha_subida: string;
}

export interface Solicitud {
  id: number;
  fecha_reporte: string;
  latitud?: number;
  longitud?: number;
  estado: 'Pendiente' | 'En proceso' | 'Atendido';
  tipo_problema?: string;
  prioridad?: string;
  /** Resumen generado por IA (placeholder) */
  resumen_ia?: string;
  descripcion_texto?: string;
  cliente?: Cliente;
  vehiculo?: Vehiculo;
  taller?: Taller;
  tecnico?: Tecnico;
  evidencias?: Evidencia[];
}

export interface Comision {
  id: number;
  monto: number;
  porcentaje: number;
  estado: string;
  fecha_registro: string;
}

export interface Pago {
  id: number;
  monto_total: number;
  metodo_pago: string;
  estado: string;
  fecha_pago: string;
  comprobante_url?: string;
  comision?: Comision;
}

export interface BitacoraEntry {
  id: number;
  fecha_hora: string;
  accion: string;
  ip_origen?: string;
  entidad_afectada?: string;
  usuario?: string;
}
