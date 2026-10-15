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
  Alimento,
  CategoriaAlimento,
  FiltroEstadoAlimento,
  FormularioAlimento,
} from '../../models/alimento.model';
import { CatalogoAlimentosLocalService } from '../../services/catalogo-alimentos-local.service';

@Component({
  selector: 'ns-catalogo-alimentos-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    PageHeadingComponent,
    MetricCardComponent,
    DataTableComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './catalogo-alimentos-page.component.html',
  styleUrl: './catalogo-alimentos-page.component.css',
})
export class CatalogoAlimentosPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly catalogoService = inject(CatalogoAlimentosLocalService);
  readonly alimentos = this.catalogoService.alimentos;
  readonly categorias: CategoriaAlimento[] = [
    'Cereales y tubérculos',
    'Frutas',
    'Verduras',
    'Proteínas',
    'Lácteos',
    'Leguminosas',
    'Otros',
  ];
  readonly filtro = signal<FiltroEstadoAlimento>('ACTIVOS');
  readonly formularioAbierto = signal(false);
  readonly alimentoEditado = signal<Alimento | null>(null);
  readonly alimentoPendiente = signal<Alimento | null>(null);
  readonly totalActivos = computed(
    () => this.alimentos().filter((alimento) => alimento.estado).length,
  );
  readonly totalInactivos = computed(
    () => this.alimentos().filter((alimento) => !alimento.estado).length,
  );
  readonly totalCategorias = computed(
    () =>
      new Set(
        this.alimentos()
          .filter((alimento) => alimento.estado)
          .map((alimento) => alimento.categoria),
      ).size,
  );
  readonly alimentosFiltrados = computed(() =>
    this.alimentos().filter((alimento) => {
      const estadoCoincide =
        this.filtro() === 'TODOS' ||
        (this.filtro() === 'ACTIVOS' ? alimento.estado : !alimento.estado);
      return estadoCoincide;
    }),
  );
  readonly foodColumns: DataTableColumn<Alimento>[] = [
    { id: 'nombre', label: 'Alimento', value: (row) => row.nombre },
    { id: 'categoria', label: 'Categoría', value: (row) => row.categoria },
    {
      id: 'porcion',
      label: 'Porción',
      value: (row) => row.porcion,
      display: (row) => `${row.porcion} ${row.unidad}`,
    },
    {
      id: 'calorias',
      label: 'Energía',
      value: (row) => row.calorias,
      display: (row) => `${this.formatNumber(row.calorias)} kcal`,
    },
    {
      id: 'proteinas',
      label: 'Proteína',
      value: (row) => row.proteinas,
      display: (row) => `${this.formatNumber(row.proteinas)} g`,
    },
    {
      id: 'carbohidratos',
      label: 'Carbohidratos',
      value: (row) => row.carbohidratos,
      display: (row) => `${this.formatNumber(row.carbohidratos)} g`,
    },
    {
      id: 'grasas',
      label: 'Grasas',
      value: (row) => row.grasas,
      display: (row) => `${this.formatNumber(row.grasas)} g`,
    },
    { id: 'estado', label: 'Estado', value: (row) => (row.estado ? 'Activo' : 'Inactivo') },
  ];
  readonly foodActions = [
    { id: 'editar', label: () => 'Editar' },
    { id: 'estado', label: (row: Alimento) => (row.estado ? 'Desactivar' : 'Activar') },
  ];

  readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    categoria: ['Cereales y tubérculos' as CategoriaAlimento, Validators.required],
    porcion: [100, [Validators.required, Validators.min(0.1), Validators.max(10000)]],
    unidad: ['g', [Validators.required, Validators.maxLength(12)]],
    calorias: [0, [Validators.required, Validators.min(0), Validators.max(10000)]],
    proteinas: [0, [Validators.required, Validators.min(0), Validators.max(10000)]],
    carbohidratos: [0, [Validators.required, Validators.min(0), Validators.max(10000)]],
    grasas: [0, [Validators.required, Validators.min(0), Validators.max(10000)]],
  });

  openCreate(): void {
    this.alimentoEditado.set(null);
    this.form.reset({
      nombre: '',
      categoria: 'Cereales y tubérculos',
      porcion: 100,
      unidad: 'g',
      calorias: 0,
      proteinas: 0,
      carbohidratos: 0,
      grasas: 0,
    });
    this.formularioAbierto.set(true);
  }

  openEdit(alimento: Alimento): void {
    this.alimentoEditado.set(alimento);
    this.form.reset({
      nombre: alimento.nombre,
      categoria: alimento.categoria,
      porcion: alimento.porcion,
      unidad: alimento.unidad,
      calorias: alimento.calorias,
      proteinas: alimento.proteinas,
      carbohidratos: alimento.carbohidratos,
      grasas: alimento.grasas,
    });
    this.formularioAbierto.set(true);
  }

  closeForm(): void {
    this.formularioAbierto.set(false);
    this.alimentoEditado.set(null);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const value: FormularioAlimento = {
      nombre: raw.nombre!.trim(),
      categoria: raw.categoria!,
      porcion: Number(raw.porcion),
      unidad: raw.unidad!.trim(),
      calorias: Number(raw.calorias),
      proteinas: Number(raw.proteinas),
      carbohidratos: Number(raw.carbohidratos),
      grasas: Number(raw.grasas),
    };
    const editing = this.alimentoEditado();
    if (editing) this.catalogoService.update(editing.id, value);
    else this.catalogoService.create(value);
    this.closeForm();
  }

  requestStatusChange(alimento: Alimento): void {
    this.alimentoPendiente.set(alimento);
  }
  onTableAction(event: DataTableActionEvent<Alimento>): void {
    if (event.actionId === 'editar') this.openEdit(event.row);
    else this.requestStatusChange(event.row);
  }
  confirmStatusChange(): void {
    const alimento = this.alimentoPendiente();
    if (!alimento) return;
    this.catalogoService.setActive(alimento.id, !alimento.estado);
    this.alimentoPendiente.set(null);
  }
  setFilter(filtro: FiltroEstadoAlimento): void {
    this.filtro.set(filtro);
  }
  formatNumber(value: number): string {
    return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 }).format(value);
  }
}
