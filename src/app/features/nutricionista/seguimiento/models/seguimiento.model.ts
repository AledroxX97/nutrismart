export type NivelAdherencia = 'ALTA' | 'PARCIAL' | 'BAJA';

export interface NotaSeguimiento {
  id: number;
  paciente_id: number;
  fecha: string;
  tipo: 'CONTACTO' | 'CONSULTA' | 'OBSERVACION';
  nota: string;
  proximo_paso: string;
}

export interface ReporteAdherencia {
  paciente_id: number;
  porcentaje: number;
  nivel: NivelAdherencia;
  fecha_reporte: string;
  comentario: string;
}
