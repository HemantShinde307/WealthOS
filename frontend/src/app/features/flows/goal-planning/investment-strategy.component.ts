import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Goal, Scheme } from '../../../core/models/domain.models';
import { SchemeService } from '../../../core/services/scheme.service';
import { GoalService } from '../../../core/services/goal.service';
import { AuthService } from '../../../core/services/auth.service';
import { GoalPlanningStateService } from './goal-planning-state.service';

interface StrategyProfile {
  expectedReturn: number;
  equityPct: number;
  debtPct: number;
  goldPct: number;
}

const STRATEGY_BY_CATEGORY: Record<Goal['category'], StrategyProfile> = {
  Retirement: { expectedReturn: 12, equityPct: 70, debtPct: 20, goldPct: 10 },
  'Wealth Creation': { expectedReturn: 13, equityPct: 75, debtPct: 15, goldPct: 10 },
  Education: { expectedReturn: 11, equityPct: 60, debtPct: 30, goldPct: 10 },
  Home: { expectedReturn: 10, equityPct: 55, debtPct: 35, goldPct: 10 },
  Wedding: { expectedReturn: 9, equityPct: 45, debtPct: 45, goldPct: 10 },
  Travel: { expectedReturn: 8, equityPct: 40, debtPct: 50, goldPct: 10 },
  'Emergency Fund': { expectedReturn: 6, equityPct: 10, debtPct: 80, goldPct: 10 },
};

function monthsBetween(targetDate: string): number {
  if (!targetDate) return 12;
  const [y, m] = targetDate.split('-').map(Number);
  const now = new Date();
  const months = (y - now.getFullYear()) * 12 + (m - (now.getMonth() + 1));
  return Math.max(months, 1);
}

@Component({
  selector: 'app-goal-investment-strategy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './investment-strategy.component.html',
})
export class InvestmentStrategyComponent {
  private readonly schemeService = inject(SchemeService);
  private readonly goalService = inject(GoalService);
  private readonly auth = inject(AuthService);
  readonly state = inject(GoalPlanningStateService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);

  readonly months = computed(() => monthsBetween(this.state.targetDate()));
  readonly years = computed(() => Math.round((this.months() / 12) * 10) / 10);

  readonly profile = computed<StrategyProfile>(() => STRATEGY_BY_CATEGORY[this.state.category() ?? 'Wealth Creation']);

  readonly monthlyRate = computed(() => this.profile().expectedReturn / 100 / 12);

  readonly requiredSip = computed(() => {
    const n = this.months();
    const r = this.monthlyRate();
    const fvCurrent = this.state.currentSavings() * Math.pow(1 + r, n);
    const remaining = Math.max(this.state.targetAmount() - fvCurrent, 0);
    if (remaining === 0) return 0;
    const annuityFactor = ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    return Math.round(remaining / annuityFactor);
  });

  readonly allocationSegments = computed(() => {
    const p = this.profile();
    let cumulative = 0;
    const segs = [
      { label: 'Equity', pct: p.equityPct, colorVar: '--color-secondary' },
      { label: 'Debt', pct: p.debtPct, colorVar: '--color-primary-fixed-dim' },
      { label: 'Gold', pct: p.goldPct, colorVar: '--color-tertiary-fixed-dim' },
    ];
    return segs.map((s) => {
      const start = cumulative;
      cumulative += s.pct;
      return { ...s, start, end: cumulative };
    });
  });

  readonly donutGradient = computed(() =>
    this.allocationSegments()
      .map((seg) => `var(${seg.colorVar}) ${seg.start}% ${seg.end}%`)
      .join(', '),
  );

  readonly suggestedSchemes = computed(() => {
    const sip = this.requiredSip();
    const p = this.profile();
    const equitySchemes = this.topSchemes('Equity', 1);
    const debtSchemes = this.topSchemes('Debt', 1);
    const goldSchemes = this.topSchemes('Gold', 1);
    const rows: { scheme: Scheme; allocPct: number; sipAmount: number }[] = [];
    if (equitySchemes[0] && p.equityPct > 0) rows.push({ scheme: equitySchemes[0], allocPct: p.equityPct, sipAmount: Math.round((sip * p.equityPct) / 100) });
    if (debtSchemes[0] && p.debtPct > 0) rows.push({ scheme: debtSchemes[0], allocPct: p.debtPct, sipAmount: Math.round((sip * p.debtPct) / 100) });
    if (goldSchemes[0] && p.goldPct > 0) rows.push({ scheme: goldSchemes[0], allocPct: p.goldPct, sipAmount: Math.round((sip * p.goldPct) / 100) });
    return rows;
  });

  private topSchemes(assetClass: Scheme['assetClass'], count: number): Scheme[] {
    return this.schemeService
      .byAssetClass(assetClass)
      .slice()
      .sort((a, b) => b.rating - a.rating || b.returns5y - a.returns5y)
      .slice(0, count);
  }

  createGoal(): void {
    const category = this.state.category();
    if (!category) return;
    this.submitting.set(true);
    const progressPct = Math.min(Math.round((this.state.currentSavings() / this.state.targetAmount()) * 100), 100);
    const goal = this.goalService.add({
      clientId: this.auth.currentUser().customerId ?? 'CL-SELF',
      name: this.state.goalName() || `My ${category} Goal`,
      category,
      targetAmount: this.state.targetAmount(),
      currentAmount: this.state.currentSavings(),
      targetDate: `${this.state.targetDate()}-01`,
      monthlyInvestment: this.requiredSip(),
      expectedReturn: this.profile().expectedReturn,
      progressPct,
    });
    this.state.lastGoalId.set(goal.id);
    this.state.reset();
    this.router.navigate(['/investor/goals']);
  }
}
