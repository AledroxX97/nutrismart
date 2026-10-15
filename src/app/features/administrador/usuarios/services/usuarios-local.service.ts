import { Injectable, signal } from '@angular/core';
import { FormularioUsuario, RolUsuario, Usuario } from '../models/usuario.model';

const STORAGE_KEY = 'nutrismart.usuarios';
const roleId: Record<RolUsuario, number> = { Administrador: 1, Nutricionista: 2, Paciente: 3 };
const created = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};
// Usuarios y correos ficticios para la demostración local; no son cuentas reales.
const INITIAL_USERS: Usuario[] = [
  {
    id: 501,
    rol_id: 1,
    nombre: 'Daniel Henriquez',
    correo: 'daniel@email.co',
    rol: 'Administrador',
    estado: true,
    creado: created(90),
    actualizado: created(3),
  },
  {
    id: 502,
    rol_id: 2,
    nombre: 'Sebastian Bassa',
    correo: 'sebastian@email.co',
    rol: 'Nutricionista',
    estado: true,
    creado: created(72),
    actualizado: created(5),
  },
  {
    id: 503,
    rol_id: 2,
    nombre: 'Camilo Vargas',
    correo: 'camilo.vargas@nutrismart.co',
    rol: 'Nutricionista',
    estado: true,
    creado: created(48),
    actualizado: created(8),
  },
  {
    id: 504,
    rol_id: 3,
    nombre: 'Bryan Fernandez',
    correo: 'bryan.fernandez@email.co',
    rol: 'Paciente',
    estado: true,
    creado: created(41),
    actualizado: created(2),
  },
  {
    id: 505,
    rol_id: 3,
    nombre: 'Andrés Pardo',
    correo: 'andres.pardo@email.co',
    rol: 'Paciente',
    estado: true,
    creado: created(27),
    actualizado: created(6),
  },
  {
    id: 506,
    rol_id: 3,
    nombre: 'Mariana Torres',
    correo: 'mariana.torres@email.co',
    rol: 'Paciente',
    estado: false,
    creado: created(120),
    actualizado: created(20),
  },
];

@Injectable({ providedIn: 'root' })
export class UsuariosLocalService {
  private readonly state = signal<Usuario[]>(this.load());
  readonly usuarios = this.state.asReadonly();

  create(value: FormularioUsuario): void {
    const now = new Date().toISOString();
    const usuario: Usuario = {
      id: Date.now(),
      rol_id: roleId[value.rol],
      ...value,
      correo: value.correo.trim().toLocaleLowerCase('es-CO'),
      estado: true,
      creado: now,
      actualizado: now,
    };
    this.save([usuario, ...this.state()]);
  }

  update(id: number, value: FormularioUsuario): void {
    this.save(
      this.state().map((usuario) =>
        usuario.id === id
          ? {
              ...usuario,
              ...value,
              rol_id: roleId[value.rol],
              correo: value.correo.trim().toLocaleLowerCase('es-CO'),
              actualizado: new Date().toISOString(),
            }
          : usuario,
      ),
    );
  }

  setActive(id: number, active: boolean): void {
    this.save(
      this.state().map((usuario) =>
        usuario.id === id
          ? { ...usuario, estado: active, actualizado: new Date().toISOString() }
          : usuario,
      ),
    );
  }

  emailExists(email: string, exceptId?: number): boolean {
    const normalized = email.trim().toLocaleLowerCase('es-CO');
    return this.state().some(
      (usuario) =>
        usuario.id !== exceptId && usuario.correo.toLocaleLowerCase('es-CO') === normalized,
    );
  }

  private load(): Usuario[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored) as Usuario[];
      } catch {
        /* restore initial accounts */
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }
  private save(usuarios: Usuario[]): void {
    this.state.set(usuarios);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
  }
}
