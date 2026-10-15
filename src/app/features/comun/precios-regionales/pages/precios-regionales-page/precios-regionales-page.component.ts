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
  FiltroPrecioRegional,
  FormularioPrecioRegional,
  PrecioRegional,
} from '../../models/precio-regional.model';
import { PreciosRegionalesLocalService } from '../../services/precios-regionales-local.service';

@Component({
  selector: 'ns-precios-regionales-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ConfirmDialogComponent,
    MetricCardComponent,
    PageHeadingComponent,
    DataTableComponent,
  ],
  templateUrl: './precios-regionales-page.component.html',
  styleUrl: './precios-regionales-page.component.css',
})
export class PreciosRegionalesPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly preciosService = inject(PreciosRegionalesLocalService);
  readonly precios = this.preciosService.precios;
  readonly departamentos = [
    'Antioquia',
    'Atlántico',
    'Bogotá D.C.',
    'Cundinamarca',
    'Nariño',
    'Valle del Cauca',
  ];
  readonly municipiosPorDepartamento: Record<string, string[]> = {
    Antioquia: ['Medellín'],
    Atlántico: ['Barranquilla'],
    'Bogotá D.C.': ['Bogotá'],
    Cundinamarca: ['Soacha'],
    Nariño: ['Pasto'],
    'Valle del Cauca': ['Cali'],
  };
  readonly departamentoFiltro = signal('TODOS');
  readonly filtro = signal<FiltroPrecioRegional>('ACTIVOS');
  readonly formularioAbierto = signal(false);
  readonly precioEditado = signal<PrecioRegional | null>(null);
  readonly precioPendiente = signal<PrecioRegional | null>(null);
  readonly totalActivos = computed(() => this.precios().filter((precio) => precio.estado).length);
  readonly totalInactivos = computed(
    () => this.precios().filter((precio) => !precio.estado).length,
  );
  readonly totalMunicipios = computed(
    () =>
      new Set(
        this.precios()
          .filter((precio) => precio.estado)
          .map((precio) => `${precio.departamento}|${precio.municipio}`),
      ).size,
  );
  readonly preciosFiltrados = computed(() =>
    this.precios().filter((precio) => {
      const estadoCoincide =
        this.filtro() === 'TODOS' || (this.filtro() === 'ACTIVOS' ? precio.estado : !precio.estado);
      const departamentoCoincide =
        this.departamentoFiltro() === 'TODOS' || precio.departamento === this.departamentoFiltro();
      return estadoCoincide && departamentoCoincide;
    }),
  );
  readonly priceColumns: DataTableColumn<PrecioRegional>[] = [
    { id: 'alimento', label: 'Alimento', value: (row) => row.alimento },
    {
      id: 'municipio',
      label: 'Ubicación',
      value: (row) => `${row.municipio}, ${row.departamento}`,
    },
    {
      id: 'precio',
      label: 'Precio',
      value: (row) => row.precio,
      display: (row) => this.formatCurrency(row.precio),
    },
    {
      id: 'unidad',
      label: 'Unidad',
      value: (row) => row.unidad,
      display: (row) => `por ${row.unidad}`,
    },
    {
      id: 'fecha',
      label: 'Fecha de consulta',
      value: (row) => row.fechaConsulta,
      display: (row) => this.formatDate(row.fechaConsulta),
    },
    { id: 'fuente', label: 'Fuente', value: (row) => row.fuente },
    { id: 'estado', label: 'Estado', value: (row) => (row.estado ? 'Activo' : 'Inactivo') },
  ];
  readonly priceActions = [
    { id: 'editar', label: () => 'Editar' },
    { id: 'estado', label: (row: PrecioRegional) => (row.estado ? 'Desactivar' : 'Activar') },
  ];

  readonly form = this.fb.group({
    alimento: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    departamento: ['Antioquia', Validators.required],
    municipio: ['Medellín', [Validators.required, Validators.maxLength(80)]],
    precio: [0, [Validators.required, Validators.min(1), Validators.max(100000000)]],
    unidad: ['kg', [Validators.required, Validators.maxLength(20)]],
    fechaConsulta: [new Date().toISOString().slice(0, 10), Validators.required],
    fuente: ['Registro manual', [Validators.required, Validators.maxLength(120)]],
  });

  get municipiosDisponibles(): string[] {
    return this.municipiosPorDepartamento[this.form.controls.departamento.value ?? ''] ?? [];
  }

  openCreate(): void {
    this.precioEditado.set(null);
    this.form.reset({
      alimento: '',
      departamento: 'Antioquia',
      municipio: 'Medellín',
      precio: 0,
      unidad: 'kg',
      fechaConsulta: new Date().toISOString().slice(0, 10),
      fuente: 'Registro manual',
    });
    this.formularioAbierto.set(true);
  }

  openEdit(precio: PrecioRegional): void {
    this.precioEditado.set(precio);
    this.form.reset({
      alimento: precio.alimento,
      departamento: precio.departamento,
      municipio: precio.municipio,
      precio: precio.precio,
      unidad: precio.unidad,
      fechaConsulta: precio.fechaConsulta,
      fuente: precio.fuente,
    });
    this.formularioAbierto.set(true);
  }

  onDepartamentoChange(): void {
    const municipio = this.municipiosDisponibles[0] ?? '';
    this.form.controls.municipio.setValue(municipio);
  }

  closeForm(): void {
    this.formularioAbierto.set(false);
    this.precioEditado.set(null);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const value: FormularioPrecioRegional = {
      alimento: raw.alimento!.trim(),
      departamento: raw.departamento!,
      municipio: raw.municipio!.trim(),
      precio: Number(raw.precio),
      unidad: raw.unidad!.trim(),
      fechaConsulta: raw.fechaConsulta!,
      fuente: raw.fuente!.trim(),
    };
    const editing = this.precioEditado();
    if (editing) this.preciosService.update(editing.id, value);
    else this.preciosService.create(value);
    this.closeForm();
  }

  requestStatusChange(precio: PrecioRegional): void {
    this.precioPendiente.set(precio);
  }
  onTableAction(event: DataTableActionEvent<PrecioRegional>): void {
    if (event.actionId === 'editar') this.openEdit(event.row);
    else this.requestStatusChange(event.row);
  }
  confirmStatusChange(): void {
    const precio = this.precioPendiente();
    if (!precio) return;
    this.preciosService.setActive(precio.id, !precio.estado);
    this.precioPendiente.set(null);
  }
  setFilter(filtro: FiltroPrecioRegional): void {
    this.filtro.set(filtro);
  }
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value);
  }
  formatDate(value: string): string {
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(`${value}T12:00:00Z`));
  }
}
