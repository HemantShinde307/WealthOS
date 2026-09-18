import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GoalService } from '../../../core/services/goal.service';
import { AuthService } from '../../../core/services/auth.service';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';
import { MobileTxnStateService } from '../transactions/mobile-txn-state.service';

@Component({
  selector: 'app-mobile-goals',
  standalone: true,
  imports: [CommonModule, InrCompactPipe],
  templateUrl: './mobile-goals.component.html',
})
export class MobileGoalsComponent {
  private readonly goalService = inject(GoalService);
  private readonly auth = inject(AuthService);
  private readonly txnState = inject(MobileTxnStateService);
  private readonly router = inject(Router);

  /** Only this customer's goals — GoalService itself holds every advisor client's goals. */
  readonly myGoals = computed(() => this.goalService.goals().filter((g) => g.clientId === this.auth.currentUser().customerId));

  readonly categoryIcons: Partial<Record<string, string>> = {
    Retirement: 'savings',
    Education: 'school',
    Home: 'home',
    Wedding: 'favorite',
    Travel: 'flight',
    'Wealth Creation': 'trending_up',
    'Emergency Fund': 'health_and_safety',
  };

  yearsRemaining(targetDate: string): string {
    const today = new Date('2026-09-07');
    const target = new Date(targetDate);
    const years = (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (years <= 0) return 'Due now';
    if (years < 1) return `${Math.max(1, Math.round(years * 12))} Months Remaining`;
    return `${Math.round(years)} Years Remaining`;
  }

  statusLabel(progressPct: number): 'On Track' | 'Needs Attention' {
    return progressPct >= 40 ? 'On Track' : 'Needs Attention';
  }

  topUp(goalName: string, monthlyInvestment: number): void {
    this.txnState.startInvestment({ amount: monthlyInvestment || 10000, purposeLabel: `Goal top-up: ${goalName}` });
    this.router.navigate(['/mobile/payment-selection']);
  }
}
