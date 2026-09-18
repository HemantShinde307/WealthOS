import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService, ROLE_HOME_ROUTE, ROLE_LABELS, UserRole } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly roles: UserRole[] = ['investor', 'advisor', 'admin', 'institutional', 'family_office'];
  readonly roleLabels = ROLE_LABELS;
  readonly selectedRole = signal<UserRole>('investor');

  readonly email = signal('');
  readonly password = signal('');
  readonly showPassword = signal(false);
  readonly error = signal<string | null>(null);
  readonly submitting = signal(false);

  async submit(): Promise<void> {
    this.error.set(null);
    this.submitting.set(true);
    const result = await this.auth.login(this.email(), this.password(), this.selectedRole());
    this.submitting.set(false);
    if (!result.success) {
      this.error.set(result.error ?? 'Something went wrong. Please try again.');
      return;
    }
    this.router.navigate([ROLE_HOME_ROUTE[this.selectedRole()]]);
  }

  private static readonly DEMO_EMAILS: Record<UserRole, string> = {
    investor: 'hemantshinde307@gmail.com',
    advisor: 'amit.deshmukh@wealthos.com',
    admin: 'admin@wealthos.com',
    institutional: 'institutional@wealthos.com',
    family_office: 'familyoffice@wealthos.com',
  };

  fillDemo(): void {
    this.email.set(LoginComponent.DEMO_EMAILS[this.selectedRole()]);
    this.password.set('demo1234');
  }
}
