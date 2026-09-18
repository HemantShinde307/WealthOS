import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { AuthService } from '../../../core/services/auth.service';
import { MOCK_BANK_ACCOUNTS, RedemptionStateService } from './redemption-state.service';

const EXIT_LOAD_PCT = 0.5;

@Component({
  selector: 'app-redemption-review-confirm',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './review-confirm.component.html',
})
export class ReviewConfirmComponent {
  private readonly portfolioService = inject(PortfolioService);
  private readonly transactionService = inject(TransactionService);
  private readonly auth = inject(AuthService);
  readonly state = inject(RedemptionStateService);
  private readonly router = inject(Router);

  readonly holding = computed(() => this.portfolioService.holdings().find((h) => h.schemeId === this.state.selectedSchemeId()));
  readonly bankAccount = computed(() => MOCK_BANK_ACCOUNTS.find((b) => b.id === this.state.bankAccountId()));

  readonly redeemUnits = computed(() => {
    const h = this.holding();
    if (!h) return 0;
    return this.state.redeemBy() === 'Units' ? this.state.units() : (h.currentNav > 0 ? this.state.amount() / h.currentNav : 0);
  });

  readonly grossAmount = computed(() => {
    const h = this.holding();
    if (!h) return 0;
    return this.state.redeemBy() === 'Amount' ? this.state.amount() : this.state.units() * h.currentNav;
  });

  readonly exitLoad = computed(() => Number(((this.grossAmount() * EXIT_LOAD_PCT) / 100).toFixed(2)));
  readonly netAmount = computed(() => Number((this.grossAmount() - this.exitLoad()).toFixed(2)));

  readonly submitting = signal(false);

  confirm(): void {
    const h = this.holding();
    if (!h) return;
    this.submitting.set(true);
    const txn = this.transactionService.add({
      clientId: this.auth.currentUser().customerId ?? 'CL-SELF',
      clientName: this.auth.currentUser().name,
      type: 'Redemption',
      schemeName: h.schemeName,
      amount: this.netAmount(),
      units: Number(this.redeemUnits().toFixed(3)),
      nav: h.currentNav,
      status: 'Processing',
      date: new Date().toISOString().slice(0, 10),
    });
    this.portfolioService.recordRedemption(h.schemeName, this.redeemUnits(), this.netAmount());
    this.state.lastTxnId.set(txn.id);
    this.router.navigate(['/redemption/success']);
  }
}
