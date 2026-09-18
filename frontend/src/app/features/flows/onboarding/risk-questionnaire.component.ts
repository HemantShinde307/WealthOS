import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OnboardingStateService, RISK_QUESTIONS } from './onboarding-state.service';

@Component({
  selector: 'app-risk-questionnaire',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './risk-questionnaire.component.html',
})
export class RiskQuestionnaireComponent {
  readonly state = inject(OnboardingStateService);
  private readonly router = inject(Router);

  readonly questions = RISK_QUESTIONS;
  readonly answeredCount = computed(() => Object.keys(this.state.answers()).length);
  readonly progressPct = computed(() => (this.answeredCount() / this.questions.length) * 100);

  select(questionId: string, score: number): void {
    this.state.setAnswer(questionId, score);
  }

  continue(): void {
    this.router.navigate(['/onboarding/risk-results']);
  }
}
