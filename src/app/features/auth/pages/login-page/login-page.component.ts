import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LocalAuthService } from '../../../../core/services/local-auth.service';
import { LocalSessionService } from '../../../../core/services/local-session.service';
import { ROLE_LABELS, ROLES, UserRole } from '../../../../core/models/role.model';
import { AppBrandComponent } from '../../../../shared/components/app-brand/app-brand.component';
import { AppFooterComponent } from '../../../../shared/components/app-footer/app-footer.component';

@Component({
  selector: 'ns-login-page',
  imports: [FormsModule, AppBrandComponent, AppFooterComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent {
  readonly roles = ROLES;
  readonly roleLabels = ROLE_LABELS;
  readonly selectedRole = signal<UserRole>('nutricionista');
  email = '';
  password = '';
  readonly errorMessage = signal('');

  constructor(
    private readonly auth: LocalAuthService,
    private readonly session: LocalSessionService,
    private readonly router: Router,
  ) {}

  enterDemo(): void {
    this.errorMessage.set('');
    const account = this.auth.authenticate(this.email, this.password, this.selectedRole());

    if (!account) {
      this.errorMessage.set('Correo, contraseña o rol incorrectos. Verifica los datos e inténtalo de nuevo.');
      return;
    }

    this.session.selectRole(account.role);
    this.password = '';
    void this.router.navigate(['/inicio']);
  }
}
