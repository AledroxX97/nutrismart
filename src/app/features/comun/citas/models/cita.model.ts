export type EstadoCita = 'PROGRAMADA' | 'REPROGRAMADA' | 'REALIZADA' | 'CANCELADA';
export type FiltroCita = 'PROXIMAS' | 'HISTORIAL' | 'TODAS';

export interface Cita {
  id: number;
  paciente_id: number;
  nutricionista_id: number;
  nutricionista_nombre: string;
  inicio: string;
  fin: string;
  estado_cita: EstadoCita;
  motivo: string;
  estado: boolean;
  creado: string;
  actualizado: string;
}

export interface NutricionistaCita {
  id: number;
  nombre: string;
}
