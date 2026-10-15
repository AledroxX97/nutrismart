import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeadingComponent } from '../../../../../shared/components/page-heading/page-heading.component';
import {
  ControlAntropometrico,
  PacientesDemoService,
} from '../../../../nutricionista/pacientes/services/pacientes-demo.service';
import { ReporteAdherencia } from '../../../../nutricionista/seguimiento/models/seguimiento.model';
import { SeguimientoDemoService } from '../../../../nutricionista/seguimiento/services/seguimiento-demo.service';

const PACIENTE_DEMO_ID = 101;
interface PuntoGrafica {
  x: number;
  y: number;
  peso: number;
  fecha: string;
}

@Component({
  selector: 'ns-evolucion-page',
  imports: [CommonModule, RouterLink, PageHeadingComponent],
  templateUrl: './evolucion-page.component.html',
  styleUrl: './evolucion-page.component.css',
})
export class EvolucionPageComponent {
  private readonly pacientesService = inject(PacientesDemoService);
  private readonly seguimientoService = inject(SeguimientoDemoService);
  readonly paciente = computed(
    () => this.pacientesService.patients().find((item) => item.id === PACIENTE_DEMO_ID) ?? null,
  );
  readonly controles = computed(() =>
    [...this.pacientesService.detail(PACIENTE_DEMO_ID).controles].sort((a, b) =>
      a.fecha_control.localeCompare(b.fecha_control),
    ),
  );
  readonly historialReciente = computed(() => [...this.controles()].reverse());
  readonly ultimoControl = computed(() => this.historialReciente()[0] ?? null);
  readonly controlAnterior = computed(() => this.historialReciente()[1] ?? null);
  readonly objetivo = computed(() => this.pacientesService.detail(PACIENTE_DEMO_ID).objetivo);
  readonly adherencia = computed(() => this.seguimientoService.adherenceFor(PACIENTE_DEMO_ID));
  readonly puntosGrafica = computed(() => this.makePoints(this.controles()));
  readonly lineaGrafica = computed(() =>
    this.puntosGrafica()
      .map((point) => `${point.x},${point.y}`)
      .join(' '),
  );
  readonly marcasGrafica = computed(() => {
    const weights = this.controles().map((control) => control.peso_kg);
    if (!weights.length) return [];
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const spread = Math.max(max - min, 1);
    return [
      Number((max + spread * 0.25).toFixed(1)),
      Number(((max + min) / 2).toFixed(1)),
      Number((min - spread * 0.25).toFixed(1)),
    ];
  });
  readonly variacionPeso = computed(() => {
    const latest = this.ultimoControl();
    const previous = this.controlAnterior();
    return latest && previous ? Number((latest.peso_kg - previous.peso_kg).toFixed(1)) : null;
  });
  readonly imc = computed(() => {
    const control = this.ultimoControl();
    if (!control) return null;
    const meters = control.estatura_cm / 100;
    return Number((control.peso_kg / (meters * meters)).toFixed(1));
  });

  dateLabel(value: string): string {
    return new Intl.DateTimeFormat('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(`${value.slice(0, 10)}T12:00:00`));
  }
  variationLabel(value: number | null): string {
    return value === null
      ? 'Un control registrado'
      : value > 0
        ? `+${value} kg frente al anterior`
        : value < 0
          ? `${value} kg frente al anterior`
          : 'Sin variación frente al anterior';
  }
  variationClass(value: number | null): string {
    return value === null || value === 0 ? 'neutral' : value > 0 ? 'increase' : 'decrease';
  }
  adherenceLevel(report: ReporteAdherencia | null): string {
    return report
      ? { ALTA: 'Buena constancia', PARCIAL: 'En proceso', BAJA: 'Requiere acompañamiento' }[
          report.nivel
        ]
      : 'Sin reporte';
  }
  trackControl(_index: number, control: ControlAntropometrico): number {
    return control.id;
  }

  private makePoints(controls: ControlAntropometrico[]): PuntoGrafica[] {
    if (!controls.length) return [];
    const weights = controls.map((control) => control.peso_kg);
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const spread = Math.max(max - min, 1);
    const bottom = min - spread * 0.25;
    const top = max + spread * 0.25;
    return controls.map((control, index) => ({
      x: controls.length === 1 ? 332 : 52 + index * (536 / (controls.length - 1)),
      y: 188 - ((control.peso_kg - bottom) / (top - bottom)) * 142,
      peso: control.peso_kg,
      fecha: control.fecha_control,
    }));
  }
}
