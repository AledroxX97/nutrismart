export type TipoComida = 'DESAYUNO' | 'MEDIA_MANANA' | 'ALMUERZO' | 'MERIENDA' | 'CENA';
export type EstadoPlan = 'BORRADOR' | 'APROBADO' | 'ENTREGADO' | 'REEMPLAZADO';

export interface ComidaPlanDemo {
  id: number;
  dia: number;
  tipo_comida: TipoComida;
  alimento: string;
  cantidad: number;
  unidad: string;
}

export interface PlanDemo {
  id: number;
  paciente_id: number;
  nombre: string;
  objetivo: string;
  estado_plan: EstadoPlan;
  numero_version: number;
  notas: string;
  detalles: ComidaPlanDemo[];
  actualizado: string;
}

export interface OpcionAlimento {
  nombre: string;
  categoria: string;
  unidad: string;
}
