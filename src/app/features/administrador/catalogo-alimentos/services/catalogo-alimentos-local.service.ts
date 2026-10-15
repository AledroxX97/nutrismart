import { Injectable, signal } from '@angular/core';
import { Alimento, FormularioAlimento } from '../models/alimento.model';

const STORAGE_KEY = 'nutrismart.catalogo-alimentos';
const SEED_VERSION_KEY = `${STORAGE_KEY}.seed-version`;
const SEED_VERSION = '2';
const ALIMENTOS_INICIALES: Alimento[] = [
  {
    id: 1001,
    nombre: 'Arroz blanco cocido',
    categoria: 'Cereales y tubérculos',
    porcion: 100,
    unidad: 'g',
    calorias: 130,
    proteinas: 2.7,
    carbohidratos: 28.2,
    grasas: 0.3,
    estado: true,
    fuente: 'USDA FoodData Central; arroz blanco cocido (referencia genérica)',
  },
  {
    id: 1002,
    nombre: 'Papa criolla cocida',
    categoria: 'Cereales y tubérculos',
    porcion: 100,
    unidad: 'g',
    calorias: 85,
    proteinas: 1.4,
    carbohidratos: 18.1,
    grasas: 0,
    estado: true,
    fuente: 'ICBF TCAC 2018; B070, papa criolla cocida sin sal',
  },
  {
    id: 1003,
    nombre: 'Arepa de maíz blanco trillado asada',
    categoria: 'Cereales y tubérculos',
    porcion: 100,
    unidad: 'g',
    calorias: 160,
    proteinas: 3.6,
    carbohidratos: 35.5,
    grasas: 0.5,
    estado: true,
    fuente: 'ICBF TCAC 2015; arepa blanca trillada, asada, 100 g',
  },
  {
    id: 1004,
    nombre: 'Lentejas cocidas',
    categoria: 'Leguminosas',
    porcion: 100,
    unidad: 'g',
    calorias: 116,
    proteinas: 9,
    carbohidratos: 20.1,
    grasas: 0.4,
    estado: true,
    fuente: 'USDA FoodData Central; lentejas cocidas (referencia genérica)',
  },
  {
    id: 1005,
    nombre: 'Pechuga de pollo cocida',
    categoria: 'Proteínas',
    porcion: 100,
    unidad: 'g',
    calorias: 165,
    proteinas: 31,
    carbohidratos: 0,
    grasas: 3.6,
    estado: true,
    fuente: 'USDA FoodData Central; pechuga de pollo cocida (referencia genérica)',
  },
  {
    id: 1006,
    nombre: 'Huevo cocido',
    categoria: 'Proteínas',
    porcion: 50,
    unidad: 'g',
    calorias: 78,
    proteinas: 6.3,
    carbohidratos: 0.6,
    grasas: 5.3,
    estado: true,
    fuente: 'USDA FoodData Central; huevo duro (referencia genérica)',
  },
  {
    id: 1007,
    nombre: 'Aguacate Hass crudo',
    categoria: 'Frutas',
    porcion: 100,
    unidad: 'g',
    calorias: 221,
    proteinas: 1.3,
    carbohidratos: 13.5,
    grasas: 16.4,
    estado: true,
    fuente: 'ICBF TCAC 2018; C001, aguacate Hass crudo',
  },
  {
    id: 1008,
    nombre: 'Mango',
    categoria: 'Frutas',
    porcion: 100,
    unidad: 'g',
    calorias: 60,
    proteinas: 0.8,
    carbohidratos: 15,
    grasas: 0.4,
    estado: true,
    fuente: 'USDA FoodData Central; mango crudo (referencia genérica)',
  },
  {
    id: 1009,
    nombre: 'Tomate',
    categoria: 'Verduras',
    porcion: 100,
    unidad: 'g',
    calorias: 23,
    proteinas: 0.9,
    carbohidratos: 4.1,
    grasas: 0.1,
    estado: true,
    fuente: 'ICBF TCAC 2018; B103, tomate crudo',
  },
  {
    id: 1010,
    nombre: 'Leche entera',
    categoria: 'Lácteos',
    porcion: 200,
    unidad: 'ml',
    calorias: 122,
    proteinas: 6.4,
    carbohidratos: 9.6,
    grasas: 6.6,
    estado: true,
    fuente: 'USDA FoodData Central; leche entera (referencia genérica)',
  },
];

@Injectable({ providedIn: 'root' })
export class CatalogoAlimentosLocalService {
  private readonly state = signal<Alimento[]>(this.load());
  readonly alimentos = this.state.asReadonly();

  create(value: FormularioAlimento): void {
    this.save([
      { ...value, id: Date.now(), estado: true, fuente: 'Registro manual' },
      ...this.state(),
    ]);
  }

  update(id: number, value: FormularioAlimento): void {
    this.save(
      this.state().map((alimento) =>
        alimento.id === id ? { ...alimento, ...value, fuente: 'Registro manual' } : alimento,
      ),
    );
  }

  setActive(id: number, active: boolean): void {
    this.save(
      this.state().map((alimento) =>
        alimento.id === id ? { ...alimento, estado: active } : alimento,
      ),
    );
  }

  private load(): Alimento[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Alimento[];
        // Actualiza filas precargadas incluso si se editaron; conserva alimentos manuales.
        if (localStorage.getItem(SEED_VERSION_KEY) !== SEED_VERSION) {
          const idsPrecargados = new Set(ALIMENTOS_INICIALES.map((alimento) => alimento.id));
          const registrosManuales = parsed.filter((alimento) => !idsPrecargados.has(alimento.id));
          const actualizados = [...ALIMENTOS_INICIALES, ...registrosManuales];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizados));
          localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
          return actualizados;
        }
        return parsed;
      } catch {
        /* restore initial catalog */
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ALIMENTOS_INICIALES));
    localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
    return ALIMENTOS_INICIALES;
  }

  private save(alimentos: Alimento[]): void {
    this.state.set(alimentos);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alimentos));
    localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
  }
}
