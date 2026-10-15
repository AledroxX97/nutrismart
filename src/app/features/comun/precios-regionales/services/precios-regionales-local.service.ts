import { Injectable, signal } from '@angular/core';
import { FormularioPrecioRegional, PrecioRegional } from '../models/precio-regional.model';

const STORAGE_KEY = 'nutrismart.precios-regionales';
const SEED_VERSION_KEY = `${STORAGE_KEY}.seed-version`;
const SEED_VERSION = '2';
// Cotizaciones medias SIPSA-DANE, observadas del 29 de agosto al 4 de septiembre de 2026.
const FECHA_REFERENCIA = '2026-09-04';
const FUENTE_SIPSA = 'DANE-SIPSA, Boletín 730 (29 ago-4 sep 2026)';
const PRECIOS_INICIALES: PrecioRegional[] = [
  {
    id: 2001,
    alimento: 'Arroz de primera',
    departamento: 'Bogotá D.C.',
    municipio: 'Bogotá',
    precio: 3430,
    unidad: 'kg',
    fechaConsulta: FECHA_REFERENCIA,
    fuente: `${FUENTE_SIPSA}; Corabastos`,
    estado: true,
  },
  {
    id: 2002,
    alimento: 'Papa parda pastusa',
    departamento: 'Bogotá D.C.',
    municipio: 'Bogotá',
    precio: 2773,
    unidad: 'kg',
    fechaConsulta: FECHA_REFERENCIA,
    fuente: `${FUENTE_SIPSA}; Corabastos`,
    estado: true,
  },
  {
    id: 2003,
    alimento: 'Tomate chonto',
    departamento: 'Antioquia',
    municipio: 'Medellín',
    precio: 4525,
    unidad: 'kg',
    fechaConsulta: FECHA_REFERENCIA,
    fuente: `${FUENTE_SIPSA}; Central Mayorista de Antioquia`,
    estado: true,
  },
  {
    id: 2004,
    alimento: 'Plátano hartón verde Eje Cafetero',
    departamento: 'Antioquia',
    municipio: 'Medellín',
    precio: 2594,
    unidad: 'kg',
    fechaConsulta: FECHA_REFERENCIA,
    fuente: `${FUENTE_SIPSA}; Central Mayorista de Antioquia`,
    estado: true,
  },
  {
    id: 2005,
    alimento: 'Aguacate papelillo',
    departamento: 'Valle del Cauca',
    municipio: 'Cali',
    precio: 9115,
    unidad: 'kg',
    fechaConsulta: FECHA_REFERENCIA,
    fuente: `${FUENTE_SIPSA}; Cavasa`,
    estado: true,
  },
  {
    id: 2006,
    alimento: 'Fríjol cargamanto blanco',
    departamento: 'Antioquia',
    municipio: 'Medellín',
    precio: 12000,
    unidad: 'kg',
    fechaConsulta: FECHA_REFERENCIA,
    fuente: `${FUENTE_SIPSA}; Central Mayorista de Antioquia`,
    estado: true,
  },
  {
    id: 2007,
    alimento: 'Mango Tommy',
    departamento: 'Atlántico',
    municipio: 'Barranquilla',
    precio: 7578,
    unidad: 'kg',
    fechaConsulta: FECHA_REFERENCIA,
    fuente: `${FUENTE_SIPSA}; Barranquillita`,
    estado: true,
  },
  {
    id: 2008,
    alimento: 'Yuca ICA',
    departamento: 'Nariño',
    municipio: 'Pasto',
    precio: 2167,
    unidad: 'kg',
    fechaConsulta: FECHA_REFERENCIA,
    fuente: `${FUENTE_SIPSA}; El Potrerillo`,
    estado: true,
  },
];

@Injectable({ providedIn: 'root' })
export class PreciosRegionalesLocalService {
  private readonly state = signal<PrecioRegional[]>(this.load());
  readonly precios = this.state.asReadonly();

  create(value: FormularioPrecioRegional): void {
    this.save([{ ...value, id: Date.now(), estado: true }, ...this.state()]);
  }

  update(id: number, value: FormularioPrecioRegional): void {
    this.save(this.state().map((precio) => (precio.id === id ? { ...precio, ...value } : precio)));
  }

  setActive(id: number, active: boolean): void {
    this.save(
      this.state().map((precio) => (precio.id === id ? { ...precio, estado: active } : precio)),
    );
  }

  private load(): PrecioRegional[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as PrecioRegional[];
        // Actualiza filas precargadas incluso si se editaron; conserva registros manuales.
        if (localStorage.getItem(SEED_VERSION_KEY) !== SEED_VERSION) {
          const idsPrecargados = new Set(PRECIOS_INICIALES.map((precio) => precio.id));
          const registrosManuales = parsed.filter((precio) => !idsPrecargados.has(precio.id));
          const actualizados = [...PRECIOS_INICIALES, ...registrosManuales];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizados));
          localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
          return actualizados;
        }
        return parsed;
      } catch {
        /* restore initial examples */
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(PRECIOS_INICIALES));
    localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
    return PRECIOS_INICIALES;
  }

  private save(precios: PrecioRegional[]): void {
    this.state.set(precios);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(precios));
    localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
  }
}
