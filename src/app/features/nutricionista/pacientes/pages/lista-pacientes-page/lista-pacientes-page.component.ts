import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MetricCardComponent } from '../../../../../shared/components/metric-card/metric-card.component';
import { PageHeadingComponent } from '../../../../../shared/components/page-heading/page-heading.component';
import { DataTableComponent } from '../../../../../shared/components/data-table/data-table.component';
import {
  DataTableActionEvent,
  DataTableColumn,
} from '../../../../../shared/components/data-table/data-table.types';
import {
  PacienteDemo,
  TipoOtorgante,
  OpcionMunicipio,
  FormularioPaciente,
  ZonaPaciente,
} from '../../models/paciente.model';
import { PacientesDemoService } from '../../services/pacientes-demo.service';

const MUNICIPALITIES: OpcionMunicipio[] = [
  { codigo: '05001', nombre: 'Medellín' },
  { codigo: '05042', nombre: 'Santa Fe de Antioquia' },
  { codigo: '08001', nombre: 'Barranquilla' },
  { codigo: '11001', nombre: 'Bogotá, D. C.' },
  { codigo: '17001', nombre: 'Manizales' },
  { codigo: '50001', nombre: 'Villavicencio' },
  { codigo: '76001', nombre: 'Santiago de Cali' },
];

type StatusFilter = 'ACTIVOS' | 'INACTIVOS' | 'TODOS';

@Component({
  selector: 'ns-patients-list-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    PageHeadingComponent,
    MetricCardComponent,
    DataTableComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './lista-pacientes-page.component.html',
  styleUrl: './lista-pacientes-page.component.css',
})
export class ListaPacientesPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly patientsService = inject(PacientesDemoService);

  readonly municipalities = MUNICIPALITIES;
  readonly patients = this.patientsService.patients;
  readonly today = this.localDateToday();
  readonly statusFilter = signal<StatusFilter>('ACTIVOS');
  readonly formOpen = signal(false);
  readonly editingPatient = signal<PacienteDemo | null>(null);
  readonly patientToDeactivate = signal<PacienteDemo | null>(null);
  readonly formError = signal('');
  readonly consentVersion = 'NutriSmart-2026-01';

  readonly filteredPatients = computed(() =>
    this.patients().filter((patient) => {
      const matchesStatus =
        this.statusFilter() === 'TODOS' ||
        (this.statusFilter() === 'ACTIVOS' ? patient.estado : !patient.estado);
      return matchesStatus;
    }),
  );
  readonly patientColumns: DataTableColumn<PacienteDemo>[] = [
    { id: 'nombre', label: 'Paciente', value: (row) => this.fullName(row) },
    {
      id: 'edad',
      label: 'Edad',
      value: (row) => this.ageOf(row.fecha_nacimiento),
      display: (row) => `${this.ageOf(row.fecha_nacimiento)} años`,
    },
    {
      id: 'municipio',
      label: 'Ubicación',
      value: (row) => `${this.municipalityName(row.municipio_divipola)} ${row.municipio_divipola}`,
    },
    {
      id: 'presupuesto',
      label: 'Presupuesto semanal',
      value: (row) => row.presupuesto_semanal_cop,
      display: (row) => this.formatBudget(row.presupuesto_semanal_cop),
    },
    {
      id: 'consentimiento',
      label: 'Consentimiento',
      value: (row) => row.consentimiento_fecha,
      display: (row) => this.formatDate(row.consentimiento_fecha),
    },
    { id: 'estado', label: 'Estado', value: (row) => (row.estado ? 'Activo' : 'Inactivo') },
  ];
  readonly patientActions = [
    { id: 'ficha', label: () => 'Ficha' },
    { id: 'editar', label: () => 'Editar', disabled: (row: PacienteDemo) => !row.estado },
    { id: 'baja', label: () => 'Dar de baja', visible: (row: PacienteDemo) => row.estado },
  ];
  readonly activeCount = computed(() => this.patients().filter((patient) => patient.estado).length);
  readonly inactiveCount = computed(
    () => this.patients().filter((patient) => !patient.estado).length,
  );
  readonly minorCount = computed(
    () =>
      this.patients().filter(
        (patient) => patient.estado && this.ageOf(patient.fecha_nacimiento) < 18,
      ).length,
  );

  readonly form = this.fb.group({
    nombres: ['', [Validators.required, Validators.maxLength(100)]],
    apellidos: ['', [Validators.required, Validators.maxLength(100)]],
    fecha_nacimiento: ['', Validators.required],
    sexo: [''],
    municipio_divipola: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
    zona: ['URBANA' as ZonaPaciente, Validators.required],
    estrato: [2 as number | null, [Validators.min(1), Validators.max(6)]],
    presupuesto_semanal_cop: [150000 as number | null, Validators.min(0)],
    consentimiento_fecha: [this.localDateToday(), Validators.required],
    consentimiento_otorgado_por: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(160)],
    ],
    consentimiento_tipo_otorgante: ['PACIENTE' as TipoOtorgante, Validators.required],
    consentimiento_aceptado: [false, Validators.requiredTrue],
  });

  openCreate(): void {
    this.editingPatient.set(null);
    this.formError.set('');
    this.form.reset({
      nombres: '',
      apellidos: '',
      fecha_nacimiento: '',
      sexo: '',
      municipio_divipola: '',
      zona: 'URBANA',
      estrato: 2,
      presupuesto_semanal_cop: 150000,
      consentimiento_fecha: this.localDateToday(),
      consentimiento_otorgado_por: '',
      consentimiento_tipo_otorgante: 'PACIENTE',
      consentimiento_aceptado: false,
    });
    this.formOpen.set(true);
  }

  openEdit(patient: PacienteDemo): void {
    this.editingPatient.set(patient);
    this.formError.set('');
    this.form.reset({
      nombres: patient.nombres,
      apellidos: patient.apellidos,
      fecha_nacimiento: patient.fecha_nacimiento,
      sexo: patient.sexo ?? '',
      municipio_divipola: patient.municipio_divipola,
      zona: patient.zona ?? 'URBANA',
      estrato: patient.estrato,
      presupuesto_semanal_cop: patient.presupuesto_semanal_cop,
      consentimiento_fecha: patient.consentimiento_fecha.slice(0, 10),
      consentimiento_otorgado_por: patient.consentimiento_otorgado_por,
      consentimiento_tipo_otorgante: patient.consentimiento_tipo_otorgante,
      consentimiento_aceptado: true,
    });
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
    this.editingPatient.set(null);
  }

  savePatient(): void {
    this.formError.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const age = this.ageOf(raw.fecha_nacimiento!);
    if (age < 18 && raw.consentimiento_tipo_otorgante !== 'REPRESENTANTE') {
      this.formError.set(
        'Para menores de edad, el consentimiento debe registrarse a nombre de un representante legal.',
      );
      return;
    }

    const value: FormularioPaciente = {
      nombres: raw.nombres!.trim(),
      apellidos: raw.apellidos!.trim(),
      fecha_nacimiento: raw.fecha_nacimiento!,
      sexo: raw.sexo || null,
      municipio_divipola: raw.municipio_divipola!,
      zona: raw.zona!,
      estrato: raw.estrato,
      presupuesto_semanal_cop: raw.presupuesto_semanal_cop,
      consentimiento: {
        version_texto: this.consentVersion,
        fecha_aceptacion: new Date(`${raw.consentimiento_fecha}T12:00:00-05:00`).toISOString(),
        otorgado_por: raw.consentimiento_otorgado_por!.trim(),
        tipo_otorgante: raw.consentimiento_tipo_otorgante!,
      },
    };

    const editing = this.editingPatient();
    if (editing) this.patientsService.update(editing.id, value);
    else this.patientsService.create(value);
    this.closeForm();
  }

  requestDeactivate(patient: PacienteDemo): void {
    this.patientToDeactivate.set(patient);
  }
  onTableAction(event: DataTableActionEvent<PacienteDemo>): void {
    if (event.actionId === 'editar') this.openEdit(event.row);
    else if (event.actionId === 'baja') this.requestDeactivate(event.row);
    else void this.router.navigate(['/modulo/pacientes', event.row.id]);
  }

  confirmDeactivate(): void {
    const patient = this.patientToDeactivate();
    if (!patient) return;
    this.patientsService.deactivate(
      patient.id,
      'Baja lógica registrada en la demostración del PARCIAL 1.',
    );
    this.patientToDeactivate.set(null);
  }

  setFilter(filter: StatusFilter): void {
    this.statusFilter.set(filter);
  }

  fullName(patient: PacienteDemo): string {
    return `${patient.nombres} ${patient.apellidos}`;
  }

  ageOf(birthDate: string): number {
    const birth = new Date(`${birthDate}T12:00:00`);
    const today = new Date();
    return (
      today.getFullYear() -
      birth.getFullYear() -
      (today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
        ? 1
        : 0)
    );
  }

  municipalityName(code: string): string {
    return (
      this.municipalities.find((municipality) => municipality.codigo === code)?.nombre ??
      `Código ${code}`
    );
  }

  formatBudget(value: number | null): string {
    return value === null
      ? 'Sin definir'
      : new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          maximumFractionDigits: 0,
        }).format(value);
  }

  formatDate(value: string): string {
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(`${value.slice(0, 10)}T12:00:00`));
  }

  isMinorForm(): boolean {
    const birthDate = this.form.controls.fecha_nacimiento.value;
    return !!birthDate && this.ageOf(birthDate) < 18;
  }

  private localDateToday(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
}
