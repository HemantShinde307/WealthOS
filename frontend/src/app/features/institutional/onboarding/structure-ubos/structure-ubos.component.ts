import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MOCK_SIGNATORIES, MOCK_UBOS } from '../../institutional-data.mock';
import { OnboardingStateService } from '../onboarding-state.service';

@Component({
  selector: 'app-structure-ubos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './structure-ubos.component.html',
})
export class StructureUbosComponent {
  private readonly router = inject(Router);
  readonly state = inject(OnboardingStateService);

  readonly ubos = MOCK_UBOS;
  readonly signatories = MOCK_SIGNATORIES;

  readonly totalMappedPct = computed(() => this.ubos.reduce((sum, u) => sum + u.ownershipPct, 0));
  readonly unaccountedPct = computed(() => Math.max(0, 100 - this.totalMappedPct()));

  verificationClass(status: string): string {
    switch (status) {
      case 'Verified':
        return 'bg-tertiary-container text-on-tertiary-container';
      case 'Pending Docs':
        return 'bg-surface-container-high text-on-surface-variant';
      default:
        return 'bg-secondary-fixed text-on-secondary-fixed';
    }
  }

  continue(): void {
    this.router.navigate(['/institutional/onboarding/document-vault']);
  }
}
