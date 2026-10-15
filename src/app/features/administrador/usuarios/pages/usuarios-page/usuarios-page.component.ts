import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MetricCardComponent } from '../../../../../shared/components/metric-card/metric-card.component';
import { PageHeadingComponent } from '../../../../../shared/components/page-heading/page-heading.component';
import { DataTableComponent } from '../../../../../shared/components/data-table/data-table.component';
import {
  DataTableActionEvent,
  DataTableColumn,
} from '../../../../../shared/components/data-table/data-table.types';
import {
  FiltroEstadoUsuario,
  FormularioUsuario,
  RolUsuario,
  Usuario,
} from '../../models/usuario.model';
import { UsuariosLocalService } from '../../services/usuarios-local.service';

@Component({
  selector: 'ns-usuarios-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    PageHeadingComponent,
    MetricCardComponent,
    DataTableComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './usuarios-page.component.html',
  styleUrl: './usuarios-page.component.css',
})
export class UsuariosPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly usuariosService = inject(UsuariosLocalService);
  readonly usuarios = this.usuariosService.usuarios;
  readonly roles: RolUsuario[] = ['Administrador', 'Nutricionista', 'Paciente'];
  readonly filtro = signal<FiltroEstadoUsuario>('ACTIVOS');
  readonly formularioAbierto = signal(false);
  readonly usuarioEditado = signal<Usuario | null>(null);
  readonly usuarioPendiente = signal<Usuario | null>(null);
  readonly mensaje = signal('');
  readonly totalActivos = computed(
    () => this.usuarios().filter((usuario) => usuario.estado).length,
  );
  readonly totalInactivos = computed(
    () => this.usuarios().filter((usuario) => !usuario.estado).length,
  );
  readonly administradoresActivos = computed(
    () =>
      this.usuarios().filter((usuario) => usuario.estado && usuario.rol === 'Administrador').length,
  );
  readonly filteredUsers = computed(() =>
    this.usuarios().filter((usuario) => {
      const matchesStatus =
        this.filtro() === 'TODOS' ||
        (this.filtro() === 'ACTIVOS' ? usuario.estado : !usuario.estado);
      return matchesStatus;
    }),
  );
  readonly userColumns: DataTableColumn<Usuario>[] = [
    { id: 'nombre', label: 'Usuario', value: (row) => row.nombre },
    { id: 'correo', label: 'Correo electrónico', value: (row) => row.correo },
    { id: 'rol', label: 'Rol', value: (row) => row.rol },
    {
      id: 'creado',
      label: 'Fecha de registro',
      value: (row) => row.creado,
      display: (row) => this.formatDate(row.creado),
    },
    { id: 'estado', label: 'Estado', value: (row) => (row.estado ? 'Activo' : 'Inactivo') },
  ];
  readonly userActions = [
    { id: 'editar', label: () => 'Editar' },
    { id: 'estado', label: (row: Usuario) => (row.estado ? 'Desactivar' : 'Activar') },
  ];

  readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    rol: ['Paciente' as RolUsuario, Validators.required],
  });

  openCreate(): void {
    this.usuarioEditado.set(null);
    this.mensaje.set('');
    this.form.reset({ nombre: '', correo: '', rol: 'Paciente' });
    this.formularioAbierto.set(true);
  }
  openEdit(usuario: Usuario): void {
    this.usuarioEditado.set(usuario);
    this.mensaje.set('');
    this.form.reset({ nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol });
    this.formularioAbierto.set(true);
  }
  closeForm(): void {
    this.formularioAbierto.set(false);
    this.usuarioEditado.set(null);
    this.mensaje.set('');
  }

  saveUser(): void {
    this.mensaje.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const value: FormularioUsuario = {
      nombre: raw.nombre!.trim(),
      correo: raw.correo!.trim(),
      rol: raw.rol!,
    };
    const editing = this.usuarioEditado();
    if (this.usuariosService.emailExists(value.correo, editing?.id)) {
      this.mensaje.set('Ya existe una cuenta registrada con ese correo.');
      return;
    }
    if (
      editing?.estado &&
      editing.rol === 'Administrador' &&
      value.rol !== 'Administrador' &&
      this.administradoresActivos() < 2
    ) {
      this.mensaje.set('Debe permanecer al menos una cuenta de administrador activa.');
      return;
    }
    if (editing) this.usuariosService.update(editing.id, value);
    else this.usuariosService.create(value);
    this.closeForm();
  }

  requestStatusChange(usuario: Usuario): void {
    this.mensaje.set('');
    if (usuario.estado && usuario.rol === 'Administrador' && this.administradoresActivos() < 2) {
      this.mensaje.set('Debe permanecer al menos una cuenta de administrador activa.');
      return;
    }
    this.usuarioPendiente.set(usuario);
  }
  confirmStatusChange(): void {
    const usuario = this.usuarioPendiente();
    if (!usuario) return;
    this.usuariosService.setActive(usuario.id, !usuario.estado);
    this.usuarioPendiente.set(null);
  }
  setFilter(filtro: FiltroEstadoUsuario): void {
    this.filtro.set(filtro);
  }
  onTableAction(event: DataTableActionEvent<Usuario>): void {
    if (event.actionId === 'editar') this.openEdit(event.row);
    else this.requestStatusChange(event.row);
  }
  initials(usuario: Usuario): string {
    return usuario.nombre
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toLocaleUpperCase('es-CO');
  }
  formatDate(value: string): string {
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(`${value.slice(0, 10)}T12:00:00`));
  }
  roleClass(rol: RolUsuario): string {
    return rol.toLocaleLowerCase('es-CO');
  }
}
