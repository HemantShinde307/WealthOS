import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OnboardingStateService } from './onboarding-state.service';

@Component({
  selector: 'app-risk-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './risk-results.component.html',
})
export class RiskResultsComponent {
  readonly state = inject(OnboardingStateService);
  private readonly router = inject(Router);

  readonly profileCopy: Record<string, string> = {
    Conservative: 'You prioritize protecting your capital over chasing higher returns, with low tolerance for short-term volatility.',
    Moderate: 'You seek a balance between growth and stability, comfortable with moderate market fluctuations for better long-term returns.',
    Aggressive: 'You are comfortable with significant short-term volatility in pursuit of maximum long-term capital appreciation.',
  };

  editAnswers(): void {
    this.router.navigate(['/onboarding/risk-questionnaire']);
  }

  continue(): void {
    this.router.navigate(['/onboarding/client-details']);
  }
}
