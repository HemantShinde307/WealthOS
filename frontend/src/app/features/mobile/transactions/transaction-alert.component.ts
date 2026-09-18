import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';

@Component({
  selector: 'app-transaction-alert',
  standalone: true,
  imports: [CommonModule, InrCompactPipe],
  templateUrl: './transaction-alert.component.html',
})
export class TransactionAlertComponent {
  readonly portfolio = inject(PortfolioService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  // Illustrative rebalance suggestion — the shared mock data doesn't model target vs. actual
  // allocation drift, so a plausible adjustment is derived here from the current allocation mix.
  readonly currentEquityPct = this.portfolio.assetAllocation().find((a) => a.label === 'Equity')?.pct ?? 65;
  readonly targetEquityPct = 60;
  readonly driftAmount = Math.round((this.portfolio.currentValue() * (this.currentEquityPct - this.targetEquityPct)) / 100);

  goBack(): void {
    this.location.back();
  }

  modify(): void {
    this.router.navigate(['/mobile/portfolio']);
  }

  approve(): void {
    this.router.navigate(['/mobile/dashboard']);
  }
}
