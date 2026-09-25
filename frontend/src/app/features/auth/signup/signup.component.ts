import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { TenantService } from '../../../core/services/tenant.service';
import { AuthService } from '../../../core/services/auth.service';
import { ClientService } from '../../../core/services/client.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './signup.component.html',
})
export class SignupComponent {
  private readonly auth = inject(AuthService);
  private readonly clientService = inject(ClientService);
  private readonly router = inject(Router);
  readonly tenant = inject(TenantService);

  readonly fullName = signal('');
  readonly email = signal('');
  readonly phone = signal('');
  readonly password = signal('');
  readonly confirmPassword = signal('');
  readonly agreedToTerms = signal(false);
  readonly showPassword = signal(false);

  readonly error = signal<string | null>(null);
  readonly submitting = signal(false);

  readonly passwordsMatch = computed(() => this.password() === this.confirmPassword());

  async submit(): Promise<void> {
    this.error.set(null);

    if (!this.passwordsMatch()) {
      this.error.set('Passwords do not match.');
      return;
    }
    if (!this.agreedToTerms()) {
      this.error.set('Please accept the Terms of Service and Privacy Policy to continue.');
      return;
    }

    this.submitting.set(true);
    const result = await this.auth.signup({
      fullName: this.fullName(),
      email: this.email(),
      phone: this.phone(),
      password: this.password(),
    });
    this.submitting.set(false);
    if (!result.success) {
      this.error.set(result.error ?? 'Something went wrong. Please try again.');
      return;
    }

    // Reuse the customerId AuthService.signup() just assigned (via InvestorAccountService) so
    // this client record and the new account's portfolio/goals/transactions all key off the
    // same id — a separate id here would silently break AiInsightService's risk-profile lookup.
    this.clientService.addClient({
      id: this.auth.currentUser().customerId!,
      name: this.fullName().trim(),
      email: this.email().trim(),
      phone: this.phone().trim(),
      panMasked: '—',
      kycStatus: 'Not Started',
      riskProfile: 'Moderate',
      segment: 'Retail',
      aum: 0,
      joinedOn: new Date().toISOString().slice(0, 10),
    });

    this.router.navigate(['/onboarding/overview']);
  }
}
