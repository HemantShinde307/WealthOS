import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { SchemeService } from '../../../core/services/scheme.service';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';
import { MobileTxnStateService } from '../transactions/mobile-txn-state.service';
import { AssetClass } from '../../../core/models/domain.models';

const CATEGORY_ICON: Record<AssetClass, string> = {
  Equity: 'account_balance',
  Debt: 'account_balance_wallet',
  Hybrid: 'pie_chart',
  Gold: 'diamond',
  'Fixed Income': 'savings',
  Cash: 'payments',
};

@Component({
  selector: 'app-mobile-portfolio',
  standalone: true,
  imports: [CommonModule, InrCompactPipe],
  templateUrl: './mobile-portfolio.component.html',
})
export class MobilePortfolioComponent {
  readonly portfolio = inject(PortfolioService);
  private readonly schemeService = inject(SchemeService);
  private readonly txnState = inject(MobileTxnStateService);
  private readonly router = inject(Router);

  readonly filters: ('All' | AssetClass)[] = ['All', 'Equity', 'Debt', 'Hybrid'];
  readonly activeFilter = signal<'All' | AssetClass>('All');

  private readonly holdingsWithAssetClass = computed(() =>
    this.portfolio.holdings().map((h) => ({
      ...h,
      assetClass: this.schemeService.getById(h.schemeId)?.assetClass ?? 'Equity',
    })),
  );

  readonly filteredHoldings = computed(() => {
    const filter = this.activeFilter();
    return this.holdingsWithAssetClass().filter((h) => filter === 'All' || h.assetClass === filter);
  });

  iconFor(assetClass: AssetClass): string {
    return CATEGORY_ICON[assetClass] ?? 'account_balance';
  }

  setFilter(filter: 'All' | AssetClass): void {
    this.activeFilter.set(filter);
  }

  investIn(schemeId?: string): void {
    this.txnState.startInvestment({ schemeId });
    this.router.navigate(['/mobile/payment-selection']);
  }

  investInTopHolding(): void {
    const holdings = this.portfolio.holdings();
    this.investIn(holdings.length > 0 ? holdings[0].schemeId : undefined);
  }
}
