import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ROLE_NAVIGATION, ROLE_LABELS, UserRole } from '../../../../core/models/role.model';
import { LocalSessionService } from '../../../../core/services/local-session.service';

@Component({
  selector: 'ns-home-page',
  imports: [RouterLink],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent {
  constructor(readonly session: LocalSessionService) {}

  get role(): UserRole {
    return this.session.role() ?? 'nutricionista';
  }

  get roleLabel(): string {
    return ROLE_LABELS[this.role];
  }

  get navigation() {
    return ROLE_NAVIGATION[this.role];
  }

  get firstName(): string {
    return this.role === 'nutricionista'
      ? 'Sebastian'
      : this.role === 'administrador'
        ? 'Daniel'
        : 'Bryan';
  }

  get subtitle(): string {
    return this.role === 'nutricionista'
      ? 'Aquí tienes un resumen de tu atención nutricional.'
      : this.role === 'administrador'
        ? 'Administra los recursos que apoyan la atención nutricional.'
        : 'Consulta tu plan y revisa cómo avanza tu proceso.';
  }

  get heroTitle(): string {
    return this.role === 'nutricionista'
      ? 'Acompaña cada proceso con una mirada integral.'
      : this.role === 'administrador'
        ? 'Todo listo para mantener la plataforma organizada.'
        : 'Pequeños pasos también construyen grandes cambios.';
  }

  get heroDescription(): string {
    return this.role === 'nutricionista'
      ? 'Organiza tus pacientes, crea planes viables y sigue su evolución en un mismo lugar.'
      : this.role === 'administrador'
        ? 'Gestiona usuarios, catálogos y reglas de apoyo para el equipo.'
        : 'Encuentra tu plan vigente, tus citas y tus registros semanales.';
  }

  get dateLabel(): string {
    return new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
      .format(new Date())
      .toLocaleUpperCase('es-CO');
  }

  iconFor(icon: string): string {
    const icons: Record<string, string> = {
      people: '♙',
      nutrition: '◉',
      location: '⌖',
      tune: '⚙',
      library: '▤',
      restaurant: '◒',
      monitor: '↗',
      calendar: '▦',
      sparkles: '✳',
      check: '✓',
    };
    return icons[icon] ?? '•';
  }

  descriptionFor(slug: string): string {
    const descriptions: Record<string, string> = {
      usuarios: 'Perfiles, roles y accesos del equipo.',
      'catalogo-alimentos': 'Alimentos, porciones y valores nutricionales.',
      'precios-regionales': 'Consulta precios y disponibilidad por región.',
      'reglas-clinicas': 'Criterios que orientan recomendaciones seguras.',
      'documentos-ia': 'Fuentes documentales de consulta.',
      pacientes: 'Historias, objetivos y contexto de cada persona.',
      planes: 'Propuestas, revisiones y planes entregados.',
      seguimiento: 'Controles y evolución nutricional.',
      agenda: 'Próximas consultas y disponibilidad.',
      asistente: 'Apoyo informativo para la consulta.',
      'mi-plan': 'Tu plan vigente y lista de mercado.',
      evolucion: 'Revisa tus registros a lo largo del tiempo.',
      citas: 'Consulta tus próximas consultas.',
      adherencia: 'Registra cómo te fue durante la semana.',
    };
    return descriptions[slug] ?? 'Consulta la información de este módulo.';
  }
}
