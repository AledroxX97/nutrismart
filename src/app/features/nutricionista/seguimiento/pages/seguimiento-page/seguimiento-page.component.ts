import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PageHeadingComponent } from '../../../../../shared/components/page-heading/page-heading.component';
import { DataTableComponent } from '../../../../../shared/components/data-table/data-table.component';
import { DataTableColumn } from '../../../../../shared/components/data-table/data-table.types';
import { PacienteDemo } from '../../../pacientes/models/paciente.model';
import {
  ControlAntropometrico,
  PacientesDemoService,
} from '../../../pacientes/services/pacientes-demo.service';
import { PlanesDemoService } from '../../../planes/services/planes-demo.service';
import { NotaSeguimiento } from '../../models/seguimiento.model';
import { SeguimientoDemoService } from '../../services/seguimiento-demo.service';

@Component({
  selector: 'ns-follow-up-page',
  imports: [CommonModule, FormsModule, RouterLink, PageHeadingComponent, DataTableComponent],
  templateUrl: './seguimiento-page.component.html',
  styleUrl: './seguimiento-page.component.css',
})
export class SeguimientoPageComponent {
  private readonly patientsService = inject(PacientesDemoService);
  private readonly followupService = inject(SeguimientoDemoService);
  private readonly plansService = inject(PlanesDemoService);
  readonly patients = computed(() =>
    this.patientsService.patients().filter((patient) => patient.estado),
  );
  readonly selectedPatientId = signal<number | null>(this.patients()[0]?.id ?? null);
  readonly selectedPatient = computed(
    () => this.patients().find((patient) => patient.id === this.selectedPatientId()) ?? null,
  );
  readonly patientDetail = computed(() =>
    this.selectedPatientId() ? this.patientsService.detail(this.selectedPatientId()!) : null,
  );
  readonly notes = computed(() =>
    this.selectedPatientId() ? this.followupService.notesFor(this.selectedPatientId()!) : [],
  );
  readonly adherence = computed(() =>
    this.selectedPatientId() ? this.followupService.adherenceFor(this.selectedPatientId()!) : null,
  );
  readonly latestControl = computed(() => this.patientDetail()?.controles[0] ?? null);
  readonly controlColumns: DataTableColumn<ControlAntropometrico>[] = [
    {
      id: 'fecha',
      label: 'Fecha',
      value: (row) => row.fecha_control,
      display: (row) => this.dateLabel(row.fecha_control),
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
      value: (row) => this.bmi(row.peso_kg, row.estatura_cm),
      display: (row) => this.bmi(row.peso_kg, row.estatura_cm).toFixed(1),
    },
    { id: 'observaciones', label: 'Observaciones', value: (row) => row.observaciones },
  ];
  readonly previousControl = computed(() => this.patientDetail()?.controles[1] ?? null);
  readonly plans = this.plansService.plans;
  readonly patientSearch = signal('');
  readonly controlFormOpen = signal(false);
  readonly noteFormOpen = signal(false);
  readonly formError = signal('');
  readonly controlDate = signal(this.today());
  readonly weight = signal<number | null>(null);
  readonly height = signal<number | null>(null);
  readonly waist = signal<number | null>(null);
  readonly controlNotes = signal('');
  readonly noteType = signal<NotaSeguimiento['tipo']>('CONTACTO');
  readonly noteText = signal('');
  readonly nextStep = signal('');
  readonly todayValue = this.today();
  readonly activePlan = computed(
    () =>
      this.plans().find(
        (plan) =>
          plan.paciente_id === this.selectedPatientId() && plan.estado_plan !== 'REEMPLAZADO',
      ) ?? null,
  );
  readonly highAdherenceCount = computed(
    () =>
      this.followupService.adherenceReports().filter((report) => report.nivel === 'ALTA').length,
  );
  readonly pendingFollowups = computed(
    () =>
      this.patients().filter(
        (patient) =>
          !this.followupService.adherenceFor(patient.id) ||
          this.daysSince(this.followupService.adherenceFor(patient.id)!.fecha_reporte) > 7,
      ).length,
  );
  readonly patientsFiltered = computed(() => {
    const query = this.patientSearch().trim().toLocaleLowerCase('es-CO');
    return this.patients().filter((patient) =>
      `${patient.nombres} ${patient.apellidos}`.toLocaleLowerCase('es-CO').includes(query),
    );
  });

  selectPatient(id: number): void {
    this.selectedPatientId.set(id);
    this.closeForms();
  }
  fullName(patient: PacienteDemo): string {
    return `${patient.nombres} ${patient.apellidos}`;
  }
  initials(patient: PacienteDemo): string {
    return `${patient.nombres.charAt(0)}${patient.apellidos.charAt(0)}`;
  }
  detailFor(patientId: number) {
    return this.patientsService.detail(patientId);
  }
  adherenceFor(patientId: number) {
    return this.followupService.adherenceFor(patientId);
  }
  bmi(weight: number, heightCm: number): number {
    const meters = heightCm / 100;
    return weight / (meters * meters);
  }
  dateLabel(value: string): string {
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(`${value.slice(0, 10)}T12:00:00`));
  }
  daysSince(value: string): number {
    return Math.max(
      0,
      Math.floor((Date.now() - new Date(`${value}T12:00:00`).getTime()) / 86400000),
    );
  }
  noteTypeLabel(type: NotaSeguimiento['tipo']): string {
    return { CONTACTO: 'Contacto', CONSULTA: 'Consulta', OBSERVACION: 'Observación' }[type];
  }
  adherenceLabel(level: string): string {
    return (
      (
        {
          ALTA: 'Buena adherencia',
          PARCIAL: 'Adherencia parcial',
          BAJA: 'Requiere acompañamiento',
        } as Record<string, string>
      )[level] ?? 'Sin reporte'
    );
  }
  weightDifference(): number | null {
    const latest = this.latestControl();
    const previous = this.previousControl();
    return latest && previous ? Number((latest.peso_kg - previous.peso_kg).toFixed(1)) : null;
  }
  weightTrend(): string {
    const delta = this.weightDifference();
    return delta === null
      ? 'Un control registrado'
      : delta > 0
        ? `+${delta} kg frente al control anterior`
        : delta < 0
          ? `${delta} kg frente al control anterior`
          : 'Sin cambio frente al control anterior';
  }
  openControlForm(): void {
    this.formError.set('');
    this.controlDate.set(this.today());
    this.weight.set(null);
    this.height.set(null);
    this.waist.set(null);
    this.controlNotes.set('');
    this.controlFormOpen.set(true);
  }
  saveControl(): void {
    const patientId = this.selectedPatientId();
    const weight = this.weight();
    const height = this.height();
    const waist = this.waist();
    if (
      !patientId ||
      !weight ||
      weight <= 0 ||
      weight > 500 ||
      !height ||
      height <= 30 ||
      height > 250 ||
      !this.controlDate()
    ) {
      this.formError.set('Completa fecha, peso y estatura con valores válidos.');
      return;
    }
    if (this.controlDate() > this.today()) {
      this.formError.set('La fecha del control no puede ser futura.');
      return;
    }
    if (waist !== null && (waist <= 0 || waist > 300)) {
      this.formError.set('La medida de cintura debe estar entre 0 y 300 cm.');
      return;
    }
    this.patientsService.addControl(patientId, {
      fecha_control: new Date(`${this.controlDate()}T12:00:00-05:00`).toISOString(),
      peso_kg: weight,
      estatura_cm: height,
      cintura_cm: waist,
      observaciones: this.controlNotes().trim(),
    });
    this.controlFormOpen.set(false);
  }
  openNoteForm(): void {
    this.formError.set('');
    this.noteType.set('CONTACTO');
    this.noteText.set('');
    this.nextStep.set('');
    this.noteFormOpen.set(true);
  }
  saveNote(): void {
    const patientId = this.selectedPatientId();
    if (!patientId || this.noteText().trim().length < 5) {
      this.formError.set('Escribe una nota de al menos 5 caracteres.');
      return;
    }
    this.followupService.addNote(patientId, this.noteType(), this.noteText(), this.nextStep());
    this.noteFormOpen.set(false);
  }
  closeForms(): void {
    this.controlFormOpen.set(false);
    this.noteFormOpen.set(false);
    this.formError.set('');
  }
  private today(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
}
