import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { AuthService } from '../../../core/services/auth.service';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';
import { MobileTxnStateService } from '../transactions/mobile-txn-state.service';

@Component({
  selector: 'app-mobile-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, InrCompactPipe],
  templateUrl: './mobile-dashboard.component.html',
})
export class MobileDashboardComponent {
  readonly portfolio = inject(PortfolioService);
  readonly transactionService = inject(TransactionService);
  readonly auth = inject(AuthService);
  private readonly txnState = inject(MobileTxnStateService);
  private readonly router = inject(Router);

  // Illustrative — no intraday NAV feed in the mock data set.
  readonly dayChangePct = 0.8;

  readonly allocationSegments = computed(() => {
    let cumulative = 0;
    return this.portfolio.assetAllocation().map((a) => {
      const start = cumulative;
      cumulative += a.pct;
      return { ...a, start, end: cumulative };
    });
  });

  readonly donutGradient = computed(() =>
    this.allocationSegments()
      .map((seg) => `var(${seg.colorVar}) ${seg.start}% ${seg.end}%`)
      .join(', '),
  );

  readonly recentTransactions = computed(() =>
    this.transactionService
      .transactions()
      .filter((t) => t.clientId === this.auth.currentUser().customerId)
      .slice(0, 3),
  );

  get firstName(): string {
    return this.auth.currentUser().name.split(' ')[0];
  }

  startInvest(): void {
    this.txnState.startInvestment({});
    this.router.navigate(['/mobile/payment-selection']);
  }
}
