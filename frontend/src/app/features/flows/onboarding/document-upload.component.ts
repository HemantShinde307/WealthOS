import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { KYC_DOCUMENTS, OnboardingStateService } from './onboarding-state.service';

@Component({
  selector: 'app-onboarding-document-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './document-upload.component.html',
})
export class DocumentUploadComponent {
  readonly state = inject(OnboardingStateService);
  private readonly router = inject(Router);

  readonly documents = KYC_DOCUMENTS;

  continue(): void {
    this.router.navigate(['/onboarding/final-review']);
  }
}
