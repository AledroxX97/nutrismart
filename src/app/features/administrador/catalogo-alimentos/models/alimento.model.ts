export type CategoriaAlimento =
  | 'Cereales y tubérculos'
  | 'Frutas'
  | 'Verduras'
  | 'Proteínas'
  | 'Lácteos'
  | 'Leguminosas'
  | 'Otros';
export type FiltroEstadoAlimento = 'ACTIVOS' | 'INACTIVOS' | 'TODOS';

export interface Alimento {
  id: number;
  nombre: string;
  categoria: CategoriaAlimento;
  porcion: number;
  unidad: string;
  calorias: number;
  proteinas: number;
  carbohidratos: number;
  grasas: number;
  estado: boolean;
  fuente: string;
}

export type FormularioAlimento = Omit<Alimento, 'id' | 'estado' | 'fuente'>;
