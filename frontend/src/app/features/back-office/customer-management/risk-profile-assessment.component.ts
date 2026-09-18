import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BackOfficeCustomer, RISK_QUESTIONNAIRE, RISK_QUESTIONNAIRE_MAX_SCORE, scoreToRiskProfile } from '../back-office-data.mock';
import { BackOfficeCustomerService } from '../back-office-customer.service';

@Component({
  selector: 'app-risk-profile-assessment',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './risk-profile-assessment.component.html',
})
export class RiskProfileAssessmentComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly boService = inject(BackOfficeCustomerService);

  readonly customerId = this.route.snapshot.paramMap.get('id')!;
  readonly customer = computed(() => this.boService.getCustomer(this.customerId));
  readonly history = computed(() => this.boService.historyFor(this.customerId));
  readonly reviewDue = computed(() => {
    const c = this.customer();
    return c ? this.boService.isReviewDue(c) : false;
  });

  readonly questions = RISK_QUESTIONNAIRE;
  readonly maxScore = RISK_QUESTIONNAIRE_MAX_SCORE;

  readonly mode = signal<'Questionnaire' | 'Manual'>('Questionnaire');
  readonly answers = signal<Record<string, number>>({});
  readonly savedQuestionnaire = signal<{ score: number; profile: BackOfficeCustomer['riskProfile'] } | null>(null);

  readonly manualProfile = signal<BackOfficeCustomer['riskProfile']>('Moderate');
  readonly manualReason = signal('');
  readonly manualSubmitted = signal(false);
  readonly manualSaved = signal(false);

  readonly answeredCount = computed(() => Object.keys(this.answers()).length);
  readonly runningScore = computed(() => Object.values(this.answers()).reduce((sum, s) => sum + s, 0));
  readonly canCompute = computed(() => this.answeredCount() === this.questions.length);
  readonly previewProfile = computed(() => (this.canCompute() ? scoreToRiskProfile(this.runningScore()) : null));

  readonly manualReasonError = computed(() => this.manualSubmitted() && !this.manualReason().trim());

  setMode(mode: 'Questionnaire' | 'Manual'): void {
    this.mode.set(mode);
    this.savedQuestionnaire.set(null);
    this.manualSaved.set(false);
  }

  answer(questionId: string, score: number): void {
    this.answers.update((a) => ({ ...a, [questionId]: score }));
    this.savedQuestionnaire.set(null);
  }

  computeAndSave(): void {
    if (!this.canCompute()) return;
    const ordered = this.questions.map((q) => this.answers()[q.id]);
    const result = this.boService.assessRiskProfileViaQuestionnaire(this.customerId, ordered);
    this.savedQuestionnaire.set(result);
  }

  applyManual(): void {
    this.manualSubmitted.set(true);
    if (!this.manualReason().trim()) return;
    this.boService.setRiskProfileManual(this.customerId, this.manualProfile(), this.manualReason().trim());
    this.manualSaved.set(true);
    this.manualReason.set('');
    this.manualSubmitted.set(false);
  }

  goToCustomer(): void {
    this.router.navigate(['/back-office/customer-management/master', this.customerId]);
  }
}
