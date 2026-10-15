import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeadingComponent } from '../../../../../shared/components/page-heading/page-heading.component';
import { PacientesDemoService } from '../../../../nutricionista/pacientes/services/pacientes-demo.service';
import {
  ComidaPlanDemo,
  PlanDemo,
  TipoComida,
} from '../../../../nutricionista/planes/models/plan.model';
import { PlanesDemoService } from '../../../../nutricionista/planes/services/planes-demo.service';
import { ListaMercadoLocalService } from '../../services/lista-mercado-local.service';

const PACIENTE_DEMO_ID = 101;
const TIEMPOS: { tipo: TipoComida; nombre: string }[] = [
  { tipo: 'DESAYUNO', nombre: 'Desayuno' },
  { tipo: 'MEDIA_MANANA', nombre: 'Media mañana' },
  { tipo: 'ALMUERZO', nombre: 'Almuerzo' },
  { tipo: 'MERIENDA', nombre: 'Merienda' },
  { tipo: 'CENA', nombre: 'Cena' },
];

interface ItemMercado {
  clave: string;
  alimento: string;
  cantidad: number;
  unidad: string;
}

@Component({
  selector: 'ns-mi-plan-page',
  imports: [CommonModule, RouterLink, PageHeadingComponent],
  templateUrl: './mi-plan-page.component.html',
  styleUrl: './mi-plan-page.component.css',
})
export class MiPlanPageComponent {
  private readonly planesService = inject(PlanesDemoService);
  private readonly pacientesService = inject(PacientesDemoService);
  private readonly listaService = inject(ListaMercadoLocalService);
  readonly paciente = computed(
    () => this.pacientesService.patients().find((item) => item.id === PACIENTE_DEMO_ID) ?? null,
  );
  readonly plan = computed(
    () =>
      this.planesService
        .plans()
        .find(
          (item) => item.paciente_id === PACIENTE_DEMO_ID && item.estado_plan === 'ENTREGADO',
        ) ?? null,
  );
  readonly checkedItems = this.listaService.checkedItems;
  readonly diaSeleccionado = signal(1);
  readonly dias = [1, 2, 3, 4, 5, 6, 7];
  readonly tiempos = TIEMPOS;
  readonly comidasDia = computed(() => {
    const plan = this.plan();
    if (!plan) return [];
    return plan.detalles
      .filter((comida) => comida.dia === this.diaSeleccionado())
      .sort(
        (a, b) =>
          this.tiempos.findIndex((tiempo) => tiempo.tipo === a.tipo_comida) -
          this.tiempos.findIndex((tiempo) => tiempo.tipo === b.tipo_comida),
      );
  });
  readonly listaMercado = computed(() => this.buildShoppingList(this.plan()));
  readonly completados = computed(
    () => this.listaMercado().filter((item) => this.checkedItems().includes(item.clave)).length,
  );
  readonly progresoMercado = computed(() =>
    this.listaMercado().length
      ? Math.round((this.completados() / this.listaMercado().length) * 100)
      : 0,
  );

  patientName(): string {
    const patient = this.paciente();
    return patient ? `${patient.nombres} ${patient.apellidos}` : 'Paciente';
  }
  formatDate(value: string): string {
    return new Intl.DateTimeFormat('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value));
  }
  mealName(type: TipoComida): string {
    return this.tiempos.find((tiempo) => tiempo.tipo === type)?.nombre ?? type;
  }
  toggleItem(item: ItemMercado): void {
    this.listaService.toggle(item.clave);
  }
  isChecked(item: ItemMercado): boolean {
    return this.checkedItems().includes(item.clave);
  }
  trackMeal(_index: number, meal: ComidaPlanDemo): number {
    return meal.id;
  }

  private buildShoppingList(plan: PlanDemo | null): ItemMercado[] {
    if (!plan) return [];
    const grouped = new Map<string, ItemMercado>();
    for (const meal of plan.detalles) {
      const normalized = meal.alimento.trim().toLocaleLowerCase('es-CO');
      const key = `${normalized}|${meal.unidad.toLocaleLowerCase('es-CO')}`;
      const current = grouped.get(key);
      if (current) current.cantidad += meal.cantidad;
      else
        grouped.set(key, {
          clave: key,
          alimento: meal.alimento,
          cantidad: meal.cantidad,
          unidad: meal.unidad,
        });
    }
    return [...grouped.values()].sort((a, b) => a.alimento.localeCompare(b.alimento, 'es-CO'));
  }
}
