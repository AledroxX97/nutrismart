import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state.component';
import { PageHeadingComponent } from '../../../../../shared/components/page-heading/page-heading.component';
import { Cita, EstadoCita, FiltroCita } from '../../../../comun/citas/models/cita.model';
import { CitasLocalService } from '../../../../comun/citas/services/citas-local.service';

const PACIENTE_DEMO_ID = 101;
const HORARIOS = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

@Component({
  selector: 'ns-mis-citas-page',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ConfirmDialogComponent,
    EmptyStateComponent,
    PageHeadingComponent,
  ],
  templateUrl: './mis-citas-page.component.html',
  styleUrl: './mis-citas-page.component.css',
})
export class MisCitasPageComponent {
  private readonly citasService = inject(CitasLocalService);
  readonly citas = computed(() => this.citasService.citasDePaciente(PACIENTE_DEMO_ID));
  readonly nutricionistas = this.citasService.nutricionistas;
  readonly horarios = HORARIOS;
  readonly filtro = signal<FiltroCita>('PROXIMAS');
  readonly modalAbierto = signal(false);
  readonly citaPendienteCancelar = signal<Cita | null>(null);
  readonly errorFormulario = signal('');
  readonly hoy = this.localToday();
  readonly fecha = signal(this.dateInDays(1));
  readonly nutricionistaId = signal(this.nutricionistas[0].id);
  readonly hora = signal(HORARIOS[0]);
  readonly motivo = signal('');
  readonly proximas = computed(() => this.citas().filter((cita) => this.isUpcoming(cita)));
  readonly realizadas = computed(() =>
    this.citas().filter((cita) => cita.estado_cita === 'REALIZADA'),
  );
  readonly citasVisibles = computed(() =>
    this.citas().filter((cita) => {
      if (this.filtro() === 'PROXIMAS') return this.isUpcoming(cita);
      if (this.filtro() === 'HISTORIAL') return !this.isUpcoming(cita);
      return true;
    }),
  );

  openRequest(): void {
    this.errorFormulario.set('');
    this.fecha.set(this.dateInDays(1));
    this.hora.set(HORARIOS[0]);
    this.nutricionistaId.set(this.nutricionistas[0].id);
    this.motivo.set('');
    this.modalAbierto.set(true);
  }
  closeRequest(): void {
    this.modalAbierto.set(false);
    this.errorFormulario.set('');
  }

  requestAppointment(): void {
    const appointment = this.citasService.create(
      PACIENTE_DEMO_ID,
      this.nutricionistaId(),
      this.fecha(),
      this.hora(),
      this.motivo(),
    );
    if (!appointment) {
      this.errorFormulario.set(
        'Ese horario ya no está disponible o no es una fecha futura. Elige otra opción.',
      );
      return;
    }
    this.closeRequest();
    this.filtro.set('PROXIMAS');
  }

  askCancel(cita: Cita): void {
    this.citaPendienteCancelar.set(cita);
  }
  confirmCancel(): void {
    const cita = this.citaPendienteCancelar();
    if (!cita || !this.isUpcoming(cita)) return;
    this.citasService.cancel(cita.id);
    this.citaPendienteCancelar.set(null);
  }
  setFilter(filtro: FiltroCita): void {
    this.filtro.set(filtro);
  }
  statusLabel(status: EstadoCita): string {
    return {
      PROGRAMADA: 'Programada',
      REPROGRAMADA: 'Reprogramada',
      REALIZADA: 'Realizada',
      CANCELADA: 'Cancelada',
    }[status];
  }
  formatDate(value: string): string {
    return new Intl.DateTimeFormat('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      timeZone: 'America/Bogota',
    }).format(new Date(value));
  }
  dayNumber(value: string): string {
    return new Intl.DateTimeFormat('es-CO', { day: '2-digit', timeZone: 'America/Bogota' }).format(
      new Date(value),
    );
  }
  monthLabel(value: string): string {
    return new Intl.DateTimeFormat('es-CO', { month: 'short', timeZone: 'America/Bogota' }).format(
      new Date(value),
    );
  }
  formatTime(value: string): string {
    return new Intl.DateTimeFormat('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Bogota',
    }).format(new Date(value));
  }
  nutritionistInitials(name: string): string {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toLocaleUpperCase('es-CO');
  }
  isUpcoming(cita: Cita): boolean {
    return (
      ['PROGRAMADA', 'REPROGRAMADA'].includes(cita.estado_cita) &&
      new Date(cita.inicio).getTime() > Date.now()
    );
  }
  private localToday(): string {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  private dateInDays(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}
