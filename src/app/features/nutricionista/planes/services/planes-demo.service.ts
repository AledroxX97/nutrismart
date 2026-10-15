import { Injectable, signal } from '@angular/core';
import { PlanDemo, ComidaPlanDemo, TipoComida, EstadoPlan } from '../models/plan.model';

const STORAGE_KEY = 'nutrismart.demo.plans';
// Planes y porciones son ejemplos didácticos; no constituyen recomendaciones clínicas.
const SEED_PLANS: PlanDemo[] = [
  {
    id: 201,
    paciente_id: 101,
    nombre: 'Plan de alimentación equilibrada',
    objetivo: 'Mejorar hábitos',
    estado_plan: 'ENTREGADO',
    numero_version: 1,
    notas: 'Priorizar alimentos frescos y preparaciones caseras.',
    actualizado: new Date().toISOString(),
    detalles: [
      {
        id: 1,
        dia: 1,
        tipo_comida: 'DESAYUNO',
        alimento: 'Avena en hojuelas',
        cantidad: 40,
        unidad: 'g',
      },
      { id: 2, dia: 1, tipo_comida: 'DESAYUNO', alimento: 'Banano', cantidad: 1, unidad: 'unidad' },
      {
        id: 3,
        dia: 1,
        tipo_comida: 'ALMUERZO',
        alimento: 'Arroz integral cocido',
        cantidad: 120,
        unidad: 'g',
      },
      {
        id: 4,
        dia: 1,
        tipo_comida: 'ALMUERZO',
        alimento: 'Pechuga de pollo',
        cantidad: 120,
        unidad: 'g',
      },
      {
        id: 5,
        dia: 1,
        tipo_comida: 'CENA',
        alimento: 'Lentejas cocidas',
        cantidad: 150,
        unidad: 'g',
      },
      {
        id: 6,
        dia: 2,
        tipo_comida: 'DESAYUNO',
        alimento: 'Arepa de maíz',
        cantidad: 1,
        unidad: 'unidad',
      },
      {
        id: 7,
        dia: 2,
        tipo_comida: 'ALMUERZO',
        alimento: 'Fríjol cargamanto cocido',
        cantidad: 140,
        unidad: 'g',
      },
    ],
  },
  {
    id: 202,
    paciente_id: 102,
    nombre: 'Organización semanal',
    objetivo: 'Organización alimentaria',
    estado_plan: 'BORRADOR',
    numero_version: 1,
    notas: 'Ajustar opciones al presupuesto semanal.',
    actualizado: new Date().toISOString(),
    detalles: [
      { id: 8, dia: 1, tipo_comida: 'DESAYUNO', alimento: 'Huevos', cantidad: 2, unidad: 'unidad' },
      {
        id: 9,
        dia: 1,
        tipo_comida: 'ALMUERZO',
        alimento: 'Papa criolla cocida',
        cantidad: 150,
        unidad: 'g',
      },
      {
        id: 10,
        dia: 1,
        tipo_comida: 'MERIENDA',
        alimento: 'Mandarina',
        cantidad: 2,
        unidad: 'unidad',
      },
    ],
  },
];

@Injectable({ providedIn: 'root' })
export class PlanesDemoService {
  private readonly state = signal<PlanDemo[]>(this.load());
  readonly plans = this.state.asReadonly();

  create(patientId: number, name: string, objective: string, notes: string): PlanDemo {
    const plan: PlanDemo = {
      id: Date.now(),
      paciente_id: patientId,
      nombre: name.trim(),
      objetivo: objective,
      estado_plan: 'BORRADOR',
      numero_version: 1,
      notas: notes.trim(),
      detalles: [],
      actualizado: new Date().toISOString(),
    };
    this.save([plan, ...this.state()]);
    return plan;
  }

  addMeal(planId: number, meal: Omit<ComidaPlanDemo, 'id'>): void {
    this.update(planId, (plan) => ({
      ...plan,
      detalles: [...plan.detalles, { ...meal, id: Date.now() }],
      actualizado: new Date().toISOString(),
    }));
  }

  removeMeal(planId: number, mealId: number): void {
    this.update(planId, (plan) => ({
      ...plan,
      detalles: plan.detalles.filter((meal) => meal.id !== mealId),
      actualizado: new Date().toISOString(),
    }));
  }

  updateStatus(planId: number, status: EstadoPlan): void {
    this.update(planId, (plan) => ({
      ...plan,
      estado_plan: status,
      actualizado: new Date().toISOString(),
    }));
  }

  private update(planId: number, transform: (plan: PlanDemo) => PlanDemo): void {
    this.save(this.state().map((plan) => (plan.id === planId ? transform(plan) : plan)));
  }
  private load(): PlanDemo[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored) as PlanDemo[];
      } catch {
        /* restore initial records */
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_PLANS));
    return SEED_PLANS;
  }
  private save(plans: PlanDemo[]): void {
    this.state.set(plans);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  }
}
