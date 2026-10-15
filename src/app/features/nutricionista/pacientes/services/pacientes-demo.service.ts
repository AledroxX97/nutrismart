import { Injectable, signal } from '@angular/core';
import { PacienteDemo, FormularioPaciente } from '../models/paciente.model';

const STORAGE_KEY = 'nutrismart.demo.patients';
const CONSENT_VERSION = 'NutriSmart-2026-01';
const DETAIL_STORAGE_KEY = 'nutrismart.demo.patient-details';

export interface CondicionPaciente {
  id: number;
  nombre: string;
  observaciones: string;
}
export interface RestriccionPaciente {
  id: number;
  nombre: string;
  tipo: 'DURA' | 'PREFERENCIA';
  motivo: string;
}
export interface ObjetivoPaciente {
  tipo: string;
  descripcion: string;
  meta_cuantificable: string;
  fecha_inicio: string;
}
export interface ControlAntropometrico {
  id: number;
  fecha_control: string;
  peso_kg: number;
  estatura_cm: number;
  cintura_cm: number | null;
  observaciones: string;
}
export interface DetalleClinicoPaciente {
  condiciones: CondicionPaciente[];
  restricciones: RestriccionPaciente[];
  objetivo: ObjetivoPaciente | null;
  controles: ControlAntropometrico[];
}

// Casos clínicos y datos personales completamente ficticios para demostración académica.
const SEED_DETAILS: Record<number, DetalleClinicoPaciente> = {
  101: {
    condiciones: [{ id: 1, nombre: 'Hipotiroidismo', observaciones: 'En seguimiento médico.' }],
    restricciones: [
      { id: 1, nombre: 'Maní', tipo: 'DURA', motivo: 'Alergia reportada.' },
      {
        id: 2,
        nombre: 'Reducir bebidas azucaradas',
        tipo: 'PREFERENCIA',
        motivo: 'Preferencia personal.',
      },
    ],
    objetivo: {
      tipo: 'Mejorar hábitos',
      descripcion: 'Aumentar consumo de alimentos frescos.',
      meta_cuantificable: 'Incluir fruta en 5 días de la semana',
      fecha_inicio: isoDaysAgo(20).slice(0, 10),
    },
    controles: [
      {
        id: 1,
        fecha_control: isoDaysAgo(8).slice(0, 10),
        peso_kg: 64.2,
        estatura_cm: 163,
        cintura_cm: 78,
        observaciones: '',
      },
      {
        id: 2,
        fecha_control: isoDaysAgo(38).slice(0, 10),
        peso_kg: 65.1,
        estatura_cm: 163,
        cintura_cm: 80,
        observaciones: '',
      },
    ],
  },
  102: {
    condiciones: [],
    restricciones: [
      { id: 1, nombre: 'Lácteos', tipo: 'PREFERENCIA', motivo: 'Prefiere alternativas vegetales.' },
    ],
    objetivo: {
      tipo: 'Organización alimentaria',
      descripcion: 'Planificar comidas dentro del presupuesto disponible.',
      meta_cuantificable: 'Preparar almuerzo en casa 4 días por semana',
      fecha_inicio: isoDaysAgo(12).slice(0, 10),
    },
    controles: [
      {
        id: 1,
        fecha_control: isoDaysAgo(13).slice(0, 10),
        peso_kg: 81.5,
        estatura_cm: 177,
        cintura_cm: 91,
        observaciones: '',
      },
    ],
  },
  103: {
    condiciones: [
      { id: 1, nombre: 'Resistencia a la insulina', observaciones: 'En seguimiento médico.' },
    ],
    restricciones: [],
    objetivo: null,
    controles: [
      {
        id: 1,
        fecha_control: isoDaysAgo(4).slice(0, 10),
        peso_kg: 70.3,
        estatura_cm: 168,
        cintura_cm: 84,
        observaciones: '',
      },
    ],
  },
  104: { condiciones: [], restricciones: [], objetivo: null, controles: [] },
};

function isoDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

// Nombres, medidas, consentimientos y ubicaciones son datos sintéticos; no representan personas reales.
const SEED_PATIENTS: PacienteDemo[] = [
  {
    id: 101,
    nombres: 'Valentina',
    apellidos: 'Ríos Cárdenas',
    fecha_nacimiento: '1998-04-17',
    sexo: 'FEMENINO',
    municipio_divipola: '05001',
    zona: 'URBANA',
    estrato: 3,
    presupuesto_semanal_cop: 185000,
    consentimiento_version: CONSENT_VERSION,
    consentimiento_fecha: isoDaysAgo(62),
    consentimiento_otorgado_por: 'Valentina Ríos Cárdenas',
    consentimiento_tipo_otorgante: 'PACIENTE',
    estado: true,
    creado: isoDaysAgo(62),
    actualizado: isoDaysAgo(8),
  },
  {
    id: 102,
    nombres: 'Andrés Felipe',
    apellidos: 'Pardo Mejía',
    fecha_nacimiento: '1987-09-03',
    sexo: 'MASCULINO',
    municipio_divipola: '11001',
    zona: 'URBANA',
    estrato: 2,
    presupuesto_semanal_cop: 142000,
    consentimiento_version: CONSENT_VERSION,
    consentimiento_fecha: isoDaysAgo(43),
    consentimiento_otorgado_por: 'Andrés Felipe Pardo Mejía',
    consentimiento_tipo_otorgante: 'PACIENTE',
    estado: true,
    creado: isoDaysAgo(43),
    actualizado: isoDaysAgo(13),
  },
  {
    id: 103,
    nombres: 'Mariana',
    apellidos: 'Torres Beltrán',
    fecha_nacimiento: '2001-12-21',
    sexo: 'FEMENINO',
    municipio_divipola: '76001',
    zona: 'URBANA',
    estrato: 4,
    presupuesto_semanal_cop: 220000,
    consentimiento_version: CONSENT_VERSION,
    consentimiento_fecha: isoDaysAgo(29),
    consentimiento_otorgado_por: 'Mariana Torres Beltrán',
    consentimiento_tipo_otorgante: 'PACIENTE',
    estado: true,
    creado: isoDaysAgo(29),
    actualizado: isoDaysAgo(4),
  },
  {
    id: 104,
    nombres: 'Samuel',
    apellidos: 'Gómez Herrera',
    fecha_nacimiento: '2014-06-09',
    sexo: 'MASCULINO',
    municipio_divipola: '05001',
    zona: 'RURAL',
    estrato: 2,
    presupuesto_semanal_cop: 128000,
    consentimiento_version: CONSENT_VERSION,
    consentimiento_fecha: isoDaysAgo(18),
    consentimiento_otorgado_por: 'Diana Herrera, representante legal',
    consentimiento_tipo_otorgante: 'REPRESENTANTE',
    estado: true,
    creado: isoDaysAgo(18),
    actualizado: isoDaysAgo(2),
  },
];

@Injectable({ providedIn: 'root' })
export class PacientesDemoService {
  private readonly patientsState = signal<PacienteDemo[]>(this.load());
  readonly patients = this.patientsState.asReadonly();
  private readonly detailsState = signal<Record<number, DetalleClinicoPaciente>>(
    this.loadDetails(),
  );

  detail(patientId: number): DetalleClinicoPaciente {
    return (
      this.detailsState()[patientId] ?? {
        condiciones: [],
        restricciones: [],
        objetivo: null,
        controles: [],
      }
    );
  }

  addCondition(patientId: number, nombre: string, observaciones: string): void {
    this.updateDetail(patientId, (detail) => ({
      ...detail,
      condiciones: [...detail.condiciones, { id: Date.now(), nombre, observaciones }],
    }));
  }

  addRestriction(
    patientId: number,
    nombre: string,
    tipo: 'DURA' | 'PREFERENCIA',
    motivo: string,
  ): void {
    this.updateDetail(patientId, (detail) => ({
      ...detail,
      restricciones: [...detail.restricciones, { id: Date.now(), nombre, tipo, motivo }],
    }));
  }

  saveObjective(patientId: number, objetivo: ObjetivoPaciente): void {
    this.updateDetail(patientId, (detail) => ({ ...detail, objetivo }));
  }

  addControl(patientId: number, control: Omit<ControlAntropometrico, 'id'>): void {
    this.updateDetail(patientId, (detail) => ({
      ...detail,
      controles: [{ ...control, id: Date.now() }, ...detail.controles],
    }));
  }

  private loadDetails(): Record<number, DetalleClinicoPaciente> {
    const stored = localStorage.getItem(DETAIL_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored) as Record<number, DetalleClinicoPaciente>;
      } catch {
        /* reseed demo data */
      }
    }
    localStorage.setItem(DETAIL_STORAGE_KEY, JSON.stringify(SEED_DETAILS));
    return SEED_DETAILS;
  }

  private updateDetail(
    patientId: number,
    update: (detail: DetalleClinicoPaciente) => DetalleClinicoPaciente,
  ): void {
    const next = { ...this.detailsState(), [patientId]: update(this.detail(patientId)) };
    this.detailsState.set(next);
    localStorage.setItem(DETAIL_STORAGE_KEY, JSON.stringify(next));
  }

  create(value: FormularioPaciente): void {
    const now = new Date().toISOString();
    const { consentimiento, ...patientData } = value;
    const patient: PacienteDemo = {
      id: Date.now(),
      ...patientData,
      consentimiento_version: consentimiento.version_texto || CONSENT_VERSION,
      consentimiento_fecha: consentimiento.fecha_aceptacion,
      consentimiento_otorgado_por: consentimiento.otorgado_por,
      consentimiento_tipo_otorgante: consentimiento.tipo_otorgante,
      estado: true,
      creado: now,
      actualizado: now,
    };
    this.save([patient, ...this.patientsState()]);
  }

  update(id: number, value: FormularioPaciente): void {
    const now = new Date().toISOString();
    const { consentimiento, ...patientData } = value;
    this.save(
      this.patientsState().map((patient) =>
        patient.id === id
          ? {
              ...patient,
              ...patientData,
              consentimiento_version:
                consentimiento.version_texto || patient.consentimiento_version,
              consentimiento_fecha: consentimiento.fecha_aceptacion || patient.consentimiento_fecha,
              consentimiento_otorgado_por:
                consentimiento.otorgado_por || patient.consentimiento_otorgado_por,
              consentimiento_tipo_otorgante: consentimiento.tipo_otorgante,
              actualizado: now,
            }
          : patient,
      ),
    );
  }

  deactivate(id: number, reason: string): void {
    this.save(
      this.patientsState().map((patient) =>
        patient.id === id
          ? {
              ...patient,
              estado: false,
              motivo_anulacion: reason,
              actualizado: new Date().toISOString(),
            }
          : patient,
      ),
    );
  }

  private load(): PacienteDemo[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_PATIENTS));
      return SEED_PATIENTS;
    }
    try {
      const value: unknown = JSON.parse(stored);
      return Array.isArray(value) ? (value as PacienteDemo[]) : SEED_PATIENTS;
    } catch {
      return SEED_PATIENTS;
    }
  }

  private save(patients: PacienteDemo[]): void {
    this.patientsState.set(patients);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
  }
}
