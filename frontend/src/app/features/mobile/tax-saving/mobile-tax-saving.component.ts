import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SchemeService } from '../../../core/services/scheme.service';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { MobileTxnStateService } from '../transactions/mobile-txn-state.service';
import { RECOMMENDED_ELSS_SCHEMES } from './tax-saving-extra.mock';

@Component({
  selector: 'app-mobile-tax-saving',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mobile-tax-saving.component.html',
})
export class MobileTaxSavingComponent {
  private readonly schemeService = inject(SchemeService);
  private readonly portfolio = inject(PortfolioService);
  private readonly txnState = inject(MobileTxnStateService);
  private readonly router = inject(Router);

  readonly financialYear = '2026-27';
  readonly section80cLimit = 150000;

  // Sum of the investor's current holdings tagged as ELSS — used as the 80C utilization figure.
  readonly elssHoldings = this.portfolio.holdings().filter((h) => h.category === 'ELSS');
  readonly section80cUsed = this.elssHoldings.reduce((sum, h) => sum + h.investedValue, 0);
  readonly utilizationPct = Math.min(100, Math.round((this.section80cUsed / this.section80cLimit) * 100));
  readonly remainingGap = Math.max(0, this.section80cLimit - this.section80cUsed);

  readonly elssSchemes = this.schemeService.schemes().filter((s) => s.category === 'ELSS');
  readonly recommended = RECOMMENDED_ELSS_SCHEMES;

  // Ring built the same way as the desktop donut — a conic-gradient circle with a punched-out hole.
  readonly ringGradient = `var(--color-primary-container) 0% ${this.utilizationPct}%, var(--color-surface-container-high) ${this.utilizationPct}% 100%`;

  investInScheme(schemeId: string): void {
    this.txnState.startInvestment({ schemeId, amount: 25000, purposeLabel: 'Section 80C Tax Saving' });
    this.router.navigate(['/mobile/payment-selection']);
  }

  // The two "Recommended" illustrative schemes aren't in the shared scheme catalogue (only one
  // real ELSS scheme exists in mock data), so route the actual purchase to that real scheme while
  // keeping the recommended fund's name visible as context on the order-review screen.
  investInRecommended(schemeName: string): void {
    const targetScheme = this.elssSchemes[0]?.id ?? 'SCH-008';
    this.txnState.startInvestment({ schemeId: targetScheme, amount: 25000, purposeLabel: `80C — ${schemeName}` });
    this.router.navigate(['/mobile/payment-selection']);
  }

  closeTheGap(): void {
    const targetScheme = this.elssSchemes[0]?.id ?? 'SCH-008';
    this.txnState.startInvestment({ schemeId: targetScheme, amount: this.remainingGap || 25000, purposeLabel: 'Section 80C Tax Saving' });
    this.router.navigate(['/mobile/payment-selection']);
  }
}
