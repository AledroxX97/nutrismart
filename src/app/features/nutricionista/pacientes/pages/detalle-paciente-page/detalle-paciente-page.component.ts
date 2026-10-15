import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PageHeadingComponent } from '../../../../../shared/components/page-heading/page-heading.component';
import { DataTableComponent } from '../../../../../shared/components/data-table/data-table.component';
import { DataTableColumn } from '../../../../../shared/components/data-table/data-table.types';
import { PacienteDemo } from '../../models/paciente.model';
import {
  ControlAntropometrico,
  DetalleClinicoPaciente,
  PacientesDemoService,
} from '../../services/pacientes-demo.service';

@Component({
  selector: 'ns-patient-detail-page',
  imports: [CommonModule, RouterLink, PageHeadingComponent, DataTableComponent],
  templateUrl: './detalle-paciente-page.component.html',
  styleUrl: './detalle-paciente-page.component.css',
})
export class DetallePacientePageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly patientsService = inject(PacientesDemoService);
  readonly patientId = Number(this.route.snapshot.paramMap.get('patientId'));
  readonly patient = computed(
    () => this.patientsService.patients().find((item) => item.id === this.patientId) ?? null,
  );
  readonly detail = computed<DetalleClinicoPaciente>(() =>
    this.patientsService.detail(this.patientId),
  );
  readonly latestControl = computed(() => this.detail().controles[0] ?? null);
  readonly controlColumns: DataTableColumn<ControlAntropometrico>[] = [
    {
      id: 'fecha',
      label: 'Fecha',
      value: (row) => row.fecha_control,
      display: (row) => this.date(row.fecha_control),
    },
    {
      id: 'peso',
      label: 'Peso',
      value: (row) => row.peso_kg,
      display: (row) => `${row.peso_kg} kg`,
    },
    {
      id: 'estatura',
      label: 'Estatura',
      value: (row) => row.estatura_cm,
      display: (row) => `${row.estatura_cm} cm`,
    },
    {
      id: 'cintura',
      label: 'Cintura',
      value: (row) => row.cintura_cm,
      display: (row) => (row.cintura_cm === null ? '—' : `${row.cintura_cm} cm`),
    },
    {
      id: 'imc',
      label: 'IMC',
      value: (row) => this.bmi(row),
      display: (row) => this.bmi(row).toFixed(1),
    },
    { id: 'observaciones', label: 'Observaciones', value: (row) => row.observaciones },
  ];

  fullName(patient: PacienteDemo): string {
    return `${patient.nombres} ${patient.apellidos}`;
  }
  age(birthDate: string): number {
    const birth = new Date(`${birthDate}T12:00:00`);
    const now = new Date();
    return (
      now.getFullYear() -
      birth.getFullYear() -
      (now.getMonth() < birth.getMonth() ||
      (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())
        ? 1
        : 0)
    );
  }
  bmi(control: ControlAntropometrico): number {
    const meters = control.estatura_cm / 100;
    return control.peso_kg / (meters * meters);
  }
  date(value: string): string {
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(`${value.slice(0, 10)}T12:00:00`));
  }
  money(value: number | null): string {
    return value === null
      ? 'Sin definir'
      : new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          maximumFractionDigits: 0,
        }).format(value);
  }

  addCondition(): void {
    const name = window.prompt('Nombre de la condición médica:')?.trim();
    if (!name) return;
    const notes = window.prompt('Observaciones (opcional):')?.trim() ?? '';
    this.patientsService.addCondition(this.patientId, name, notes);
  }
  addRestriction(): void {
    const name = window.prompt('Alimento o restricción:')?.trim();
    if (!name) return;
    const type = window.confirm(
      '¿Es una restricción estricta? Aceptar = dura; Cancelar = preferencia.',
    )
      ? 'DURA'
      : 'PREFERENCIA';
    const reason = window.prompt('Motivo (opcional):')?.trim() ?? '';
    this.patientsService.addRestriction(this.patientId, name, type, reason);
  }
  editObjective(): void {
    const current = this.detail().objetivo;
    const type = window.prompt('Tipo de objetivo:', current?.tipo ?? '')?.trim();
    if (!type) return;
    const description = window.prompt('Descripción:', current?.descripcion ?? '')?.trim() ?? '';
    const target =
      window.prompt('Meta cuantificable:', current?.meta_cuantificable ?? '')?.trim() ?? '';
    this.patientsService.saveObjective(this.patientId, {
      tipo: type,
      descripcion: description,
      meta_cuantificable: target,
      fecha_inicio: current?.fecha_inicio ?? new Date().toISOString().slice(0, 10),
    });
  }
  addControl(): void {
    const weight = Number(window.prompt('Peso en kg (ej. 64.5):'));
    if (!Number.isFinite(weight) || weight <= 0 || weight > 500) return;
    const height = Number(window.prompt('Estatura en cm (ej. 163):'));
    if (!Number.isFinite(height) || height <= 30 || height > 250) return;
    const waistInput = window.prompt('Cintura en cm (opcional):');
    const waist = waistInput?.trim() ? Number(waistInput) : null;
    if (waist !== null && (!Number.isFinite(waist) || waist <= 0 || waist > 300)) return;
    this.patientsService.addControl(this.patientId, {
      fecha_control: new Date().toISOString().slice(0, 10),
      peso_kg: weight,
      estatura_cm: height,
      cintura_cm: waist,
      observaciones: '',
    });
  }
}
