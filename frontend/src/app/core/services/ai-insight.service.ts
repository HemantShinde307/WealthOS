import { Injectable, computed, inject } from '@angular/core';
import { PortfolioService } from './portfolio.service';
import { FixedDepositService } from './fixed-deposit.service';
import { ClientService } from './client.service';
import { GoalService } from './goal.service';
import { AuthService } from './auth.service';
import { DigitalGoldStateService } from '../../features/flows/digital-gold/digital-gold-state.service';
import { Client } from '../models/domain.models';

export interface RebalanceTarget {
  label: string;
  currentPct: number;
  targetPct: number;
  driftPct: number;
}

export interface Nudge {
  id: string;
  icon: string;
  tone: 'info' | 'warning' | 'success';
  text: string;
  actionLabel?: string;
  actionRoute?: string;
}

// Target mix by risk profile. A real system would derive this from a documented
// investment policy; this is a reasonable illustrative default used consistently
// with the same allocation model already used in the goal-planning flow.
const TARGET_MIX: Record<Client['riskProfile'], { equity: number; debt: number; gold: number }> = {
  Conservative: { equity: 30, debt: 55, gold: 15 },
  Moderate: { equity: 55, debt: 30, gold: 15 },
  Aggressive: { equity: 75, debt: 15, gold: 10 },
};

@Injectable({ providedIn: 'root' })
export class AiInsightService {
  private readonly portfolio = inject(PortfolioService);
  private readonly fd = inject(FixedDepositService);
  private readonly clientService = inject(ClientService);
  private readonly goalService = inject(GoalService);
  private readonly gold = inject(DigitalGoldStateService);
  private readonly auth = inject(AuthService);

  private readonly customerId = computed(() => this.auth.currentUser().customerId);
  // Not every investor account has a matching advisor-side Client record (e.g. new signups) —
  // riskProfile below falls back to 'Moderate' when there's no match.
  readonly client = computed<Client | undefined>(() => {
    const id = this.customerId();
    return id ? this.clientService.getById(id) : undefined;
  });
  readonly riskProfile = computed<Client['riskProfile']>(() => this.client()?.riskProfile ?? 'Moderate');

  readonly goldValue = computed(() => this.gold.holdingsGrams() * this.gold.currentRate());
  readonly mfValue = this.portfolio.currentValue;
  readonly fdValue = this.fd.totalCurrentValue;
  readonly idleCash = this.fd.idleCash;

  readonly netWorth = computed(() => this.mfValue() + this.fdValue() + this.goldValue() + this.idleCash());

  readonly allocation = computed(() => {
    const total = this.netWorth() || 1;
    // Portfolio holdings are ~98/2 equity/hybrid today (see MOCK_ASSET_ALLOCATION); treat the
    // hybrid sliver as a blend so the debt bucket isn't reported as literal zero.
    const equityShare = this.mfValue() * 0.98;
    const hybridShare = this.mfValue() * 0.02;
    const equity = equityShare + hybridShare * 0.5;
    const debt = this.fdValue() + hybridShare * 0.5;
    const gold = this.goldValue();
    const cash = this.idleCash();
    return {
      equity: Math.round((equity / total) * 100),
      debt: Math.round((debt / total) * 100),
      gold: Math.round((gold / total) * 100),
      cash: Math.round((cash / total) * 100),
    };
  });

  readonly rebalanceTargets = computed<RebalanceTarget[]>(() => {
    const target = TARGET_MIX[this.riskProfile()];
    const current = this.allocation();
    return [
      { label: 'Equity (Mutual Funds)', currentPct: current.equity, targetPct: target.equity, driftPct: current.equity - target.equity },
      { label: 'Debt (FDs)', currentPct: current.debt, targetPct: target.debt, driftPct: current.debt - target.debt },
      { label: 'Gold', currentPct: current.gold, targetPct: target.gold, driftPct: current.gold - target.gold },
    ];
  });

  readonly bestHolding = computed(() => {
    const holdings = this.portfolio.holdings();
    return holdings.length ? holdings.reduce((a, b) => (b.unrealizedPlPct > a.unrealizedPlPct ? b : a)) : undefined;
  });

  readonly worstHolding = computed(() => {
    const holdings = this.portfolio.holdings();
    return holdings.length ? holdings.reduce((a, b) => (b.unrealizedPlPct < a.unrealizedPlPct ? b : a)) : undefined;
  });

  readonly summary = computed(() => {
    const a = this.allocation();
    const parts: string[] = [];
    if (a.equity > 0) parts.push(`${a.equity}% in mutual funds`);
    if (a.debt > 0) parts.push(`${a.debt}% in fixed deposits`);
    if (a.gold > 0) parts.push(`${a.gold}% in gold`);
    if (a.cash > 0) parts.push(`${a.cash}% sitting idle in cash`);
    return `Your ₹${(this.netWorth() / 100000).toFixed(2)} L net worth is split ${parts.join(', ')}.`;
  });

  readonly rebalancingNudges = computed<Nudge[]>(() => {
    const nudges: Nudge[] = [];
    for (const t of this.rebalanceTargets()) {
      if (Math.abs(t.driftPct) < 8) continue;
      if (t.driftPct > 0) {
        nudges.push({
          id: `overweight-${t.label}`,
          icon: 'trending_up',
          tone: 'warning',
          text: `${t.label} is ${t.driftPct}pp above your target for an ${this.riskProfile().toLowerCase()} risk profile (${t.currentPct}% vs ${t.targetPct}% target). Consider trimming exposure here.`,
        });
      } else {
        nudges.push({
          id: `underweight-${t.label}`,
          icon: 'trending_down',
          tone: 'info',
          text: `${t.label} is ${Math.abs(t.driftPct)}pp below your target (${t.currentPct}% vs ${t.targetPct}% target) — you may be under-diversified here.`,
          actionLabel: t.label.includes('Gold') ? 'Explore Gold SIP' : t.label.includes('Debt') ? 'Explore Fixed Deposits' : 'Explore Mutual Funds',
          actionRoute: t.label.includes('Gold') ? '/gold-sip/select-plan' : t.label.includes('Debt') ? '/corporate-fd/marketplace' : '/mf-purchase/select-scheme',
        });
      }
    }
    return nudges;
  });

  readonly fdNudges = computed<Nudge[]>(() => {
    const nudges: Nudge[] = [];
    for (const d of this.fd.maturingSoon()) {
      const days = this.fd.daysToMaturity(d);
      nudges.push({
        id: `fd-maturity-${d.id}`,
        icon: 'event_upcoming',
        tone: 'warning',
        text: `Your ${d.issuer} FD of ₹${d.principal.toLocaleString('en-IN')} matures in ${days} day${days === 1 ? '' : 's'}. Consider renewing at the best available rate, laddering it across tenures, or moving part of it into a debt fund for better liquidity.`,
        actionLabel: 'View Fixed Deposits',
        actionRoute: '/investor/ai-insights',
      });
    }
    if (this.idleCash() > 25000) {
      nudges.push({
        id: 'idle-cash',
        icon: 'savings',
        tone: 'info',
        text: `You have ₹${this.idleCash().toLocaleString('en-IN')} sitting idle in your bank account. Even a liquid or short-duration fund could put this to work instead of earning near-zero savings interest.`,
        actionLabel: 'Invest Now',
        actionRoute: '/mf-purchase/select-scheme',
      });
    }
    return nudges;
  });

  // A goal is flagged as falling behind only when it's both low-progress and has no active
  // monthly contribution moving it forward — a fully funded or actively-funded goal isn't "at risk"
  // even early on, whereas a stalled one with no SIP and little progress genuinely is.
  readonly goalHealth = computed(() =>
    this.goalService
      .goals()
      .filter((g) => g.clientId === this.customerId())
      .map((g) => ({
        goal: g,
        onTrack: g.progressPct >= 100 || g.monthlyInvestment > 0 || g.progressPct >= 40,
      })),
  );
}
