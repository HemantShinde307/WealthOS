import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OnboardingStateService } from './onboarding-state.service';

@Component({
  selector: 'app-client-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-details.component.html',
})
export class ClientDetailsComponent {
  readonly state = inject(OnboardingStateService);
  private readonly router = inject(Router);

  readonly indianStates = ['Maharashtra', 'Karnataka', 'Delhi', 'Tamil Nadu', 'Gujarat', 'West Bengal', 'Telangana', 'Rajasthan'];

  continue(): void {
    this.router.navigate(['/onboarding/document-upload']);
  }
}
