export const ROLES = ['administrador', 'nutricionista', 'paciente'] as const;

export type UserRole = (typeof ROLES)[number];

export interface NavigationItem {
  label: string;
  slug: string;
  icon: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  administrador: 'Administrador',
  nutricionista: 'Nutricionista',
  paciente: 'Paciente',
};

export const ROLE_NAVIGATION: Record<UserRole, NavigationItem[]> = {
  administrador: [
    { label: 'Usuarios y roles', slug: 'usuarios', icon: 'people' },
    { label: 'Catálogo de alimentos', slug: 'catalogo-alimentos', icon: 'nutrition' },
    { label: 'Precios regionales', slug: 'precios-regionales', icon: 'location' },
    { label: 'Reglas clínicas', slug: 'reglas-clinicas', icon: 'tune' },
    { label: 'Documentos de apoyo', slug: 'documentos-ia', icon: 'library' },
  ],
  nutricionista: [
    { label: 'Mis pacientes', slug: 'pacientes', icon: 'people' },
    { label: 'Planes alimentarios', slug: 'planes', icon: 'restaurant' },
    { label: 'Seguimiento', slug: 'seguimiento', icon: 'monitor' },
    { label: 'Agenda', slug: 'agenda', icon: 'calendar' },
    { label: 'Precios regionales', slug: 'precios-regionales', icon: 'location' },
    { label: 'Asistente', slug: 'asistente', icon: 'sparkles' },
  ],
  paciente: [
    { label: 'Mi plan', slug: 'mi-plan', icon: 'restaurant' },
    { label: 'Mi evolución', slug: 'evolucion', icon: 'monitor' },
    { label: 'Mis citas', slug: 'citas', icon: 'calendar' },
    { label: 'Mi adherencia', slug: 'adherencia', icon: 'check' },
  ],
};
