import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MOCK_SIGNATORIES, MOCK_VAULT_CATEGORIES } from '../../institutional-data.mock';
import { OnboardingStateService } from '../onboarding-state.service';

@Component({
  selector: 'app-document-vault',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './document-vault.component.html',
})
export class DocumentVaultComponent {
  private readonly router = inject(Router);
  readonly state = inject(OnboardingStateService);

  readonly categories = MOCK_VAULT_CATEGORIES;
  readonly signatories = MOCK_SIGNATORIES;

  readonly totalDocs = computed(() => this.categories.reduce((sum, c) => sum + c.documents.length, 0));
  readonly requiredDocs = this.totalDocs() + 4;
  readonly pendingDocs = computed(() => this.categories.flatMap((c) => c.documents).filter((d) => d.status !== 'Verified').length);

  docStatusIcon(status: string): string {
    return status === 'Verified' ? 'check_circle' : status === 'Pending' ? 'schedule' : 'upload';
  }

  docStatusClass(status: string): string {
    switch (status) {
      case 'Verified':
        return 'text-on-tertiary-container';
      case 'Pending':
        return 'text-secondary';
      default:
        return 'text-error';
    }
  }

  signatoryStatusClass(status: string): string {
    switch (status) {
      case 'Verified':
        return 'bg-tertiary-container text-on-tertiary-container';
      case 'Expiring':
        return 'bg-error-container text-on-error-container';
      default:
        return 'bg-secondary-fixed text-on-secondary-fixed';
    }
  }

  continue(): void {
    this.router.navigate(['/institutional/onboarding/review-queue']);
  }
}
