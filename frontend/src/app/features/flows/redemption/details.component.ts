import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { MOCK_BANK_ACCOUNTS, RedeemBy, RedemptionStateService } from './redemption-state.service';

@Component({
  selector: 'app-redemption-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './details.component.html',
})
export class DetailsComponent {
  private readonly portfolioService = inject(PortfolioService);
  readonly state = inject(RedemptionStateService);
  private readonly router = inject(Router);

  readonly bankAccounts = MOCK_BANK_ACCOUNTS;

  readonly holding = computed(() => this.portfolioService.holdings().find((h) => h.schemeId === this.state.selectedSchemeId()));

  readonly estimatedUnits = computed(() => {
    const h = this.holding();
    if (!h) return 0;
    if (this.state.redeemBy() === 'Units') return this.state.units();
    return h.currentNav > 0 ? this.state.amount() / h.currentNav : 0;
  });

  readonly estimatedAmount = computed(() => {
    const h = this.holding();
    if (!h) return 0;
    if (this.state.redeemBy() === 'Amount') return this.state.amount();
    return this.state.units() * h.currentNav;
  });

  readonly isValid = computed(() => {
    const h = this.holding();
    if (!h) return false;
    if (this.state.fullRedemption()) return true;
    return this.estimatedUnits() > 0 && this.estimatedUnits() <= h.units;
  });

  setRedeemBy(mode: RedeemBy): void {
    this.state.redeemBy.set(mode);
    this.state.fullRedemption.set(false);
  }

  toggleFull(checked: boolean): void {
    this.state.fullRedemption.set(checked);
    const h = this.holding();
    if (checked && h) {
      this.state.units.set(h.units);
      this.state.amount.set(Math.round(h.units * h.currentNav));
    }
  }

  onAmountInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.state.amount.set(isNaN(value) ? 0 : value);
  }

  onUnitsInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.state.units.set(isNaN(value) ? 0 : value);
  }

  continue(): void {
    this.router.navigate(['/redemption/review-confirm']);
  }
}
