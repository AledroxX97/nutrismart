import { Injectable, signal } from '@angular/core';
import { ReporteAdherencia, NotaSeguimiento } from '../models/seguimiento.model';

const NOTES_KEY = 'nutrismart.followup.notes';
const ADHERENCE_KEY = 'nutrismart.followup.adherence';
const dateAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
};

// Notas y reportes simulan interacciones; no provienen de pacientes reales.
const INITIAL_NOTES: NotaSeguimiento[] = [
  {
    id: 1,
    paciente_id: 101,
    fecha: dateAgo(2),
    tipo: 'CONTACTO',
    nota: 'La paciente refiere buena aceptación de las preparaciones y facilidad para conseguir los alimentos.',
    proximo_paso: 'Revisar evolución en el próximo control.',
  },
  {
    id: 2,
    paciente_id: 101,
    fecha: dateAgo(8),
    tipo: 'CONSULTA',
    nota: 'Se revisó el control antropométrico y se aclararon dudas sobre las porciones del plan.',
    proximo_paso: 'Continuar con el plan actual.',
  },
  {
    id: 3,
    paciente_id: 101,
    fecha: dateAgo(20),
    tipo: 'OBSERVACION',
    nota: 'Se definió como prioridad incluir fruta durante la semana.',
    proximo_paso: 'Verificar avance de la meta.',
  },
  {
    id: 4,
    paciente_id: 102,
    fecha: dateAgo(5),
    tipo: 'CONTACTO',
    nota: 'El paciente solicita alternativas prácticas para llevar al trabajo.',
    proximo_paso: 'Proponer opciones de preparación anticipada.',
  },
  {
    id: 5,
    paciente_id: 103,
    fecha: dateAgo(4),
    tipo: 'CONSULTA',
    nota: 'Se conversó sobre organización de horarios y variedad de alimentos.',
    proximo_paso: 'Acordar objetivo en la próxima consulta.',
  },
];
const INITIAL_ADHERENCE: ReporteAdherencia[] = [
  {
    paciente_id: 101,
    porcentaje: 82,
    nivel: 'ALTA',
    fecha_reporte: dateAgo(1),
    comentario: 'He podido seguir la mayoría de las comidas. Me fue fácil incluir fruta.',
  },
  {
    paciente_id: 102,
    porcentaje: 58,
    nivel: 'PARCIAL',
    fecha_reporte: dateAgo(5),
    comentario: 'Algunos días se me dificulta organizar el almuerzo por el horario de trabajo.',
  },
  {
    paciente_id: 103,
    porcentaje: 74,
    nivel: 'PARCIAL',
    fecha_reporte: dateAgo(3),
    comentario: 'Voy mejor con los horarios; me gustaría tener más opciones para la cena.',
  },
];

@Injectable({ providedIn: 'root' })
export class SeguimientoDemoService {
  private readonly notesState = signal<NotaSeguimiento[]>(this.load(NOTES_KEY, INITIAL_NOTES));
  private readonly adherenceState = signal<ReporteAdherencia[]>(
    this.load(ADHERENCE_KEY, INITIAL_ADHERENCE),
  );
  readonly notes = this.notesState.asReadonly();
  readonly adherenceReports = this.adherenceState.asReadonly();

  notesFor(patientId: number): NotaSeguimiento[] {
    return this.notesState()
      .filter((item) => item.paciente_id === patientId)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }
  adherenceFor(patientId: number): ReporteAdherencia | null {
    return this.adherenceState().find((item) => item.paciente_id === patientId) ?? null;
  }
  addNote(
    patientId: number,
    tipo: NotaSeguimiento['tipo'],
    nota: string,
    proximoPaso: string,
  ): void {
    const note: NotaSeguimiento = {
      id: Date.now(),
      paciente_id: patientId,
      fecha: new Date().toISOString().slice(0, 10),
      tipo,
      nota: nota.trim(),
      proximo_paso: proximoPaso.trim(),
    };
    const next = [note, ...this.notesState()];
    this.notesState.set(next);
    localStorage.setItem(NOTES_KEY, JSON.stringify(next));
  }

  private load<T>(key: string, initial: T): T {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored) as T;
      } catch {
        /* restore initial records */
      }
    }
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
}
