import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OnboardingStateService } from './onboarding-state.service';

@Component({
  selector: 'app-onboarding-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overview.component.html',
})
export class OverviewComponent {
  private readonly state = inject(OnboardingStateService);
  private readonly router = inject(Router);

  readonly steps = [
    { icon: 'assessment', title: 'Risk Assessment', description: 'A short questionnaire to understand your comfort with market risk.' },
    { icon: 'badge', title: 'Client Details', description: 'Your personal, contact and address details for account setup.' },
    { icon: 'cloud_upload', title: 'Document Upload', description: 'PAN, Aadhaar, address proof and a photograph.' },
    { icon: 'task_alt', title: 'Final Review', description: 'Confirm everything and submit for verification.' },
  ];

  start(): void {
    this.state.reset();
    this.router.navigate(['/onboarding/risk-questionnaire']);
  }
}
