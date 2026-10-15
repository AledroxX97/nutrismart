export type RolUsuario = 'Administrador' | 'Nutricionista' | 'Paciente';
export type FiltroEstadoUsuario = 'ACTIVOS' | 'INACTIVOS' | 'TODOS';

export interface Usuario {
  id: number;
  rol_id: number;
  nombre: string;
  correo: string;
  rol: RolUsuario;
  estado: boolean;
  creado: string;
  actualizado: string;
}

export interface FormularioUsuario {
  nombre: string;
  correo: string;
  rol: RolUsuario;
}
