import { Routes } from '@angular/router';
import { demoSessionGuard } from './core/guards/demo-session.guard';
import { moduleAccessGuard } from './core/guards/module-access.guard';
import { WorkspaceLayoutComponent } from './layout/workspace-layout/workspace-layout.component';

export const routes: Routes = [
  {
    path: 'acceso',
    loadComponent: () =>
      import('./features/auth/pages/login-page/login-page.component').then(
        (m) => m.LoginPageComponent,
      ),
  },
  { path: '', pathMatch: 'full', redirectTo: 'acceso' },
  {
    path: '',
    component: WorkspaceLayoutComponent,
    canActivate: [demoSessionGuard],
    children: [
      {
        path: 'inicio',
        loadComponent: () =>
          import('./features/dashboard/pages/home-page/home-page.component').then(
            (m) => m.HomePageComponent,
          ),
      },
      {
        path: 'modulo/usuarios',
        canActivate: [moduleAccessGuard],
        data: { moduleSlug: 'usuarios' },
        loadComponent: () =>
          import('./features/administrador/usuarios/pages/usuarios-page/usuarios-page.component').then(
            (m) => m.UsuariosPageComponent,
          ),
      },
      {
        path: 'modulo/catalogo-alimentos',
        canActivate: [moduleAccessGuard],
        data: { moduleSlug: 'catalogo-alimentos' },
        loadComponent: () =>
          import('./features/administrador/catalogo-alimentos/pages/catalogo-alimentos-page/catalogo-alimentos-page.component').then(
            (m) => m.CatalogoAlimentosPageComponent,
          ),
      },
      {
        path: 'modulo/precios-regionales',
        canActivate: [moduleAccessGuard],
        data: { moduleSlug: 'precios-regionales' },
        loadComponent: () =>
          import('./features/comun/precios-regionales/pages/precios-regionales-page/precios-regionales-page.component').then(
            (m) => m.PreciosRegionalesPageComponent,
          ),
      },
      {
        path: 'modulo/mi-plan',
        canActivate: [moduleAccessGuard],
        data: { moduleSlug: 'mi-plan' },
        loadComponent: () =>
          import('./features/paciente/mi-plan/pages/mi-plan-page/mi-plan-page.component').then(
            (m) => m.MiPlanPageComponent,
          ),
      },
      {
        path: 'modulo/evolucion',
        canActivate: [moduleAccessGuard],
        data: { moduleSlug: 'evolucion' },
        loadComponent: () =>
          import('./features/paciente/evolucion/pages/evolucion-page/evolucion-page.component').then(
            (m) => m.EvolucionPageComponent,
          ),
      },
      {
        path: 'modulo/citas',
        canActivate: [moduleAccessGuard],
        data: { moduleSlug: 'citas' },
        loadComponent: () =>
          import('./features/paciente/citas/pages/mis-citas-page/mis-citas-page.component').then(
            (m) => m.MisCitasPageComponent,
          ),
      },
      {
        path: 'modulo/seguimiento',
        canActivate: [moduleAccessGuard],
        data: { moduleSlug: 'seguimiento' },
        loadComponent: () =>
          import('./features/nutricionista/seguimiento/pages/seguimiento-page/seguimiento-page.component').then(
            (m) => m.SeguimientoPageComponent,
          ),
      },
      {
        path: 'modulo/planes',
        canActivate: [moduleAccessGuard],
        data: { moduleSlug: 'planes' },
        loadComponent: () =>
          import('./features/nutricionista/planes/pages/planes-page/planes-page.component').then(
            (m) => m.PlanesPageComponent,
          ),
      },
      {
        path: 'modulo/pacientes/:patientId',
        canActivate: [moduleAccessGuard],
        data: { moduleSlug: 'pacientes' },
        loadComponent: () =>
          import('./features/nutricionista/pacientes/pages/detalle-paciente-page/detalle-paciente-page.component').then(
            (m) => m.DetallePacientePageComponent,
          ),
      },
      {
        path: 'modulo/pacientes',
        canActivate: [moduleAccessGuard],
        data: { moduleSlug: 'pacientes' },
        loadComponent: () =>
          import('./features/nutricionista/pacientes/pages/lista-pacientes-page/lista-pacientes-page.component').then(
            (m) => m.ListaPacientesPageComponent,
          ),
      },
      {
        path: 'modulo/:slug',
        canActivate: [moduleAccessGuard],
        loadComponent: () =>
          import('./features/workspace/pages/module-page/module-page.component').then(
            (m) => m.ModulePageComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'inicio' },
];
