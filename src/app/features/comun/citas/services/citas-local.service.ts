import { Injectable, signal } from '@angular/core';
import { Cita, EstadoCita } from '../models/cita.model';

const STORAGE_KEY = 'nutrismart.citas';
const DEMO_PATIENT_ID = 101;
// Identidades y citas sintéticas para la demostración local.
const NUTRICIONISTAS = [
  { id: 502, nombre: 'Laura Mejía' },
  { id: 503, nombre: 'Camilo Vargas' },
];

function localDateAfter(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function zonedDate(date: string, time: string): string {
  return new Date(`${date}T${time}:00-05:00`).toISOString();
}
function demoCita(
  id: number,
  days: number,
  time: string,
  state: EstadoCita,
  motivo: string,
  nutricionista: (typeof NUTRICIONISTAS)[number],
): Cita {
  const start = zonedDate(localDateAfter(days), time);
  const end = new Date(new Date(start).getTime() + 45 * 60000).toISOString();
  const now = new Date().toISOString();
  return {
    id,
    paciente_id: DEMO_PATIENT_ID,
    nutricionista_id: nutricionista.id,
    nutricionista_nombre: nutricionista.nombre,
    inicio: start,
    fin: end,
    estado_cita: state,
    motivo,
    estado: true,
    creado: now,
    actualizado: now,
  };
}

const CITAS_INICIALES: Cita[] = [
  demoCita(3001, 3, '09:00', 'PROGRAMADA', 'Seguimiento del plan alimentario', NUTRICIONISTAS[0]),
  demoCita(3002, 11, '14:00', 'PROGRAMADA', 'Revisión de objetivos', NUTRICIONISTAS[1]),
  demoCita(3003, -12, '10:00', 'REALIZADA', 'Control nutricional', NUTRICIONISTAS[0]),
];

@Injectable({ providedIn: 'root' })
export class CitasLocalService {
  private readonly state = signal<Cita[]>(this.load());
  readonly citas = this.state.asReadonly();
  readonly nutricionistas = NUTRICIONISTAS;

  citasDePaciente(patientId: number): Cita[] {
    return this.state()
      .filter((cita) => cita.paciente_id === patientId && cita.estado)
      .sort((a, b) => a.inicio.localeCompare(b.inicio));
  }

  create(
    patientId: number,
    nutritionistId: number,
    date: string,
    time: string,
    reason: string,
  ): Cita | null {
    const nutritionist = NUTRICIONISTAS.find((item) => item.id === nutritionistId);
    if (!nutritionist) return null;
    const start = zonedDate(date, time);
    const startMs = new Date(start).getTime();
    const endMs = startMs + 45 * 60000;
    const conflict = this.state().some(
      (item) =>
        item.estado &&
        item.nutricionista_id === nutritionistId &&
        ['PROGRAMADA', 'REPROGRAMADA'].includes(item.estado_cita) &&
        startMs < new Date(item.fin).getTime() &&
        endMs > new Date(item.inicio).getTime(),
    );
    if (conflict || startMs <= Date.now()) return null;
    const now = new Date().toISOString();
    const cita: Cita = {
      id: Date.now(),
      paciente_id: patientId,
      nutricionista_id: nutritionist.id,
      nutricionista_nombre: nutritionist.nombre,
      inicio: start,
      fin: new Date(endMs).toISOString(),
      estado_cita: 'PROGRAMADA',
      motivo: reason.trim(),
      estado: true,
      creado: now,
      actualizado: now,
    };
    this.save([cita, ...this.state()]);
    return cita;
  }

  cancel(id: number): void {
    this.save(
      this.state().map((cita) =>
        cita.id === id
          ? { ...cita, estado_cita: 'CANCELADA', actualizado: new Date().toISOString() }
          : cita,
      ),
    );
  }

  private load(): Cita[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored) as Cita[];
      } catch {
        /* restore initial appointments */
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(CITAS_INICIALES));
    return CITAS_INICIALES;
  }

  private save(citas: Cita[]): void {
    this.state.set(citas);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(citas));
  }
}
