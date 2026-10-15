import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PageHeadingComponent } from '../../../../../shared/components/page-heading/page-heading.component';
import { PacienteDemo } from '../../../pacientes/models/paciente.model';
import { PacientesDemoService } from '../../../pacientes/services/pacientes-demo.service';
import { PlanDemo, OpcionAlimento, TipoComida, EstadoPlan } from '../../models/plan.model';
import { PlanesDemoService } from '../../services/planes-demo.service';

const FOODS: OpcionAlimento[] = [
  { nombre: 'Avena en hojuelas', categoria: 'Cereales', unidad: 'g' },
  { nombre: 'Arepa de maíz', categoria: 'Cereales', unidad: 'unidad' },
  { nombre: 'Arroz integral cocido', categoria: 'Cereales', unidad: 'g' },
  { nombre: 'Papa criolla cocida', categoria: 'Tubérculos', unidad: 'g' },
  { nombre: 'Yuca cocida', categoria: 'Tubérculos', unidad: 'g' },
  { nombre: 'Lentejas cocidas', categoria: 'Leguminosas', unidad: 'g' },
  { nombre: 'Fríjol cargamanto cocido', categoria: 'Leguminosas', unidad: 'g' },
  { nombre: 'Pechuga de pollo', categoria: 'Proteínas', unidad: 'g' },
  { nombre: 'Huevos', categoria: 'Proteínas', unidad: 'unidad' },
  { nombre: 'Tilapia', categoria: 'Proteínas', unidad: 'g' },
  { nombre: 'Queso campesino', categoria: 'Lácteos', unidad: 'g' },
  { nombre: 'Banano', categoria: 'Frutas', unidad: 'unidad' },
  { nombre: 'Mango', categoria: 'Frutas', unidad: 'g' },
  { nombre: 'Mandarina', categoria: 'Frutas', unidad: 'unidad' },
  { nombre: 'Aguacate', categoria: 'Grasas', unidad: 'g' },
  { nombre: 'Tomate', categoria: 'Verduras', unidad: 'g' },
  { nombre: 'Espinaca', categoria: 'Verduras', unidad: 'g' },
  { nombre: 'Leche', categoria: 'Lácteos', unidad: 'ml' },
];
const MEAL_TYPES: { value: TipoComida; label: string }[] = [
  { value: 'DESAYUNO', label: 'Desayuno' },
  { value: 'MEDIA_MANANA', label: 'Media mañana' },
  { value: 'ALMUERZO', label: 'Almuerzo' },
  { value: 'MERIENDA', label: 'Merienda' },
  { value: 'CENA', label: 'Cena' },
];

@Component({
  selector: 'ns-plans-page',
  imports: [CommonModule, FormsModule, RouterLink, PageHeadingComponent],
  templateUrl: './planes-page.component.html',
  styleUrl: './planes-page.component.css',
})
export class PlanesPageComponent {
  private readonly plansService = inject(PlanesDemoService);
  private readonly patientsService = inject(PacientesDemoService);
  readonly plans = this.plansService.plans;
  readonly patients = computed(() =>
    this.patientsService.patients().filter((patient) => patient.estado),
  );
  readonly foods = FOODS;
  readonly mealTypes = MEAL_TYPES;
  readonly selectedPlanId = signal<number | null>(this.plans()[0]?.id ?? null);
  readonly createOpen = signal(false);
  readonly mealOpen = signal(false);
  readonly search = signal('');
  readonly statusFilter = signal<'TODOS' | EstadoPlan>('TODOS');
  readonly formError = signal('');
  readonly patientId = signal<number | null>(this.patients()[0]?.id ?? null);
  readonly planName = signal('');
  readonly planNotes = signal('');
  readonly objective = signal('');
  readonly mealDay = signal(1);
  readonly mealType = signal<TipoComida>('DESAYUNO');
  readonly foodName = signal(FOODS[0].nombre);
  readonly quantity = signal<number | null>(100);
  readonly unit = signal(FOODS[0].unidad);

  readonly selectedPlan = computed(
    () => this.plans().find((plan) => plan.id === this.selectedPlanId()) ?? null,
  );
  readonly selectedPatient = computed(
    () => this.patients().find((patient) => patient.id === this.patientId()) ?? null,
  );
  readonly visiblePlans = computed(() => {
    const query = this.search().trim().toLocaleLowerCase('es-CO');
    return this.plans().filter((plan) => {
      const patient = this.patientNameById(plan.paciente_id).toLocaleLowerCase('es-CO');
      return (
        (this.statusFilter() === 'TODOS' || plan.estado_plan === this.statusFilter()) &&
        (!query ||
          plan.nombre.toLocaleLowerCase('es-CO').includes(query) ||
          patient.includes(query))
      );
    });
  });
  readonly mealCount = computed(() =>
    this.plans().reduce((sum, plan) => sum + plan.detalles.length, 0),
  );
  readonly draftCount = computed(
    () => this.plans().filter((plan) => plan.estado_plan === 'BORRADOR').length,
  );
  readonly days = [1, 2, 3, 4, 5, 6, 7];

  patientName(patient: PacienteDemo): string {
    return `${patient.nombres} ${patient.apellidos}`;
  }
  objectiveForPatient(patientId: number) {
    return this.patientsService.detail(patientId).objetivo;
  }
  patientNameById(id: number): string {
    const patient = this.patientsService.patients().find((item) => item.id === id);
    return patient ? this.patientName(patient) : 'Paciente';
  }
  countMeals(plan: PlanDemo): number {
    return plan.detalles.length;
  }
  mealsForDay(plan: PlanDemo, day: number): PlanDemo['detalles'] {
    return plan.detalles
      .filter((meal) => meal.dia === day)
      .sort(
        (a, b) =>
          this.mealTypes.findIndex((type) => type.value === a.tipo_comida) -
          this.mealTypes.findIndex((type) => type.value === b.tipo_comida),
      );
  }
  mealLabel(type: TipoComida): string {
    return this.mealTypes.find((meal) => meal.value === type)?.label ?? type;
  }
  statusLabel(status: EstadoPlan): string {
    return {
      BORRADOR: 'Borrador',
      APROBADO: 'Aprobado',
      ENTREGADO: 'Entregado',
      REEMPLAZADO: 'Reemplazado',
    }[status];
  }
  statusClass(status: EstadoPlan): string {
    return status.toLowerCase();
  }

  selectPatient(id: number | null): void {
    this.patientId.set(id);
    const objective = id ? this.patientsService.detail(id).objetivo : null;
    this.objective.set(objective?.tipo ?? '');
  }
  openCreate(): void {
    this.formError.set('');
    this.planName.set('');
    this.planNotes.set('');
    const first = this.patients()[0];
    this.patientId.set(first?.id ?? null);
    this.objective.set(first ? (this.patientsService.detail(first.id).objetivo?.tipo ?? '') : '');
    this.createOpen.set(true);
  }
  createPlan(): void {
    this.formError.set('');
    if (!this.patientId() || this.planName().trim().length < 2) {
      this.formError.set('Selecciona un paciente y escribe un nombre para el plan.');
      return;
    }
    const plan = this.plansService.create(
      this.patientId()!,
      this.planName(),
      this.objective(),
      this.planNotes(),
    );
    this.selectedPlanId.set(plan.id);
    this.createOpen.set(false);
  }
  openMealForm(): void {
    this.formError.set('');
    this.mealDay.set(1);
    this.mealType.set('DESAYUNO');
    this.foodName.set(FOODS[0].nombre);
    this.quantity.set(100);
    this.unit.set(FOODS[0].unidad);
    this.mealOpen.set(true);
  }
  changeFood(name: string): void {
    this.foodName.set(name);
    this.unit.set(FOODS.find((food) => food.nombre === name)?.unidad ?? 'g');
  }
  saveMeal(): void {
    const plan = this.selectedPlan();
    const quantity = this.quantity();
    if (!plan || !this.foodName().trim() || !quantity || quantity <= 0) {
      this.formError.set('Completa el alimento y una cantidad válida.');
      return;
    }
    this.plansService.addMeal(plan.id, {
      dia: this.mealDay(),
      tipo_comida: this.mealType(),
      alimento: this.foodName(),
      cantidad: quantity,
      unidad: this.unit(),
    });
    this.mealOpen.set(false);
    this.formError.set('');
  }
  removeMeal(planId: number, mealId: number): void {
    this.plansService.removeMeal(planId, mealId);
  }
  advanceStatus(plan: PlanDemo): void {
    const next: EstadoPlan | null =
      plan.estado_plan === 'BORRADOR'
        ? 'APROBADO'
        : plan.estado_plan === 'APROBADO'
          ? 'ENTREGADO'
          : null;
    if (next) this.plansService.updateStatus(plan.id, next);
  }
}
