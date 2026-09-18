import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ClientService } from '../../../core/services/client.service';
import { AuthService } from '../../../core/services/auth.service';
import { KYC_DOCUMENTS, OnboardingStateService } from './onboarding-state.service';

// Well clear of the seeded advisor client ids (CL-1001..CL-1013) so a staff-initiated
// onboarding (see below) never collides with an existing customer's record.
let nextStaffOnboardedId = 1100;

@Component({
  selector: 'app-onboarding-final-review',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './final-review.component.html',
})
export class FinalReviewComponent {
  readonly state = inject(OnboardingStateService);
  private readonly clientService = inject(ClientService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly documents = KYC_DOCUMENTS;
  readonly submitting = signal(false);

  // Reached two ways: a brand-new investor completing their own KYC right after signup
  // (self-service — the signed-in customerId already exists and must be reused so this
  // client record lines up with their portfolio/goals), or a staff member (see the
  // admin dashboard's "New Customer" button) onboarding someone who isn't logged in at
  // all — that case needs a freshly generated id instead.
  private get selfServiceCustomerId(): string | null {
    const user = this.auth.currentUser();
    return user.role === 'investor' ? (user.customerId ?? null) : null;
  }

  submit(): void {
    this.submitting.set(true);
    const pan = this.state.pan().trim().toUpperCase();
    const id = this.selfServiceCustomerId ?? `CL-${nextStaffOnboardedId++}`;
    this.clientService.addClient({
      id,
      name: this.state.fullName(),
      email: this.state.email(),
      phone: this.state.phone(),
      panMasked: pan ? `${pan.slice(0, 5)}****${pan.slice(-1)}` : '',
      kycStatus: 'Pending',
      riskProfile: this.state.riskProfile(),
      segment: 'Retail',
      aum: 0,
      joinedOn: new Date().toISOString().slice(0, 10),
    });
    this.state.clientId.set(id);
    this.state.submitted.set(true);
  }

  goToDashboard(): void {
    const wasSelfService = this.selfServiceCustomerId !== null;
    const id = this.state.clientId();
    this.state.reset();
    this.router.navigate(wasSelfService ? ['/investor/portfolio'] : ['/advisor/clients', id]);
  }
}
