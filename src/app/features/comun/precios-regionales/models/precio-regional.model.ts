export interface PrecioRegional {
  id: number;
  alimento: string;
  departamento: string;
  municipio: string;
  precio: number;
  unidad: string;
  fechaConsulta: string;
  fuente: string;
  estado: boolean;
}

export type FormularioPrecioRegional = Omit<PrecioRegional, 'id' | 'estado'>;
export type FiltroPrecioRegional = 'ACTIVOS' | 'INACTIVOS' | 'TODOS';
