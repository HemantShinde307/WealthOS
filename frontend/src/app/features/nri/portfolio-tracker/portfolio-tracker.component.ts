import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NriDataService } from '../nri-data.service';

type HoldingFilter = 'All' | 'NRE' | 'NRO';

@Component({
  selector: 'app-nri-portfolio-tracker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio-tracker.component.html',
})
export class PortfolioTrackerComponent {
  readonly nri = inject(NriDataService);

  readonly filterOptions: HoldingFilter[] = ['All', 'NRE', 'NRO'];

  readonly selectedClientId = signal<string | undefined>(undefined);
  readonly viewCurrency = signal<'INR' | 'USD'>('INR');
  readonly holdingFilter = signal<HoldingFilter>('All');

  readonly selectedView = computed(() => {
    const views = this.nri.views();
    const id = this.selectedClientId() ?? views[0]?.client.id;
    return views.find((v) => v.client.id === id);
  });

  readonly totalAum = computed(() => {
    const p = this.selectedView()?.profile;
    return p ? p.aumNre + p.aumNro : 0;
  });

  readonly filteredHoldings = computed(() => {
    const holdings = this.selectedView()?.profile.holdings ?? [];
    const filter = this.holdingFilter();
    return filter === 'All' ? holdings : holdings.filter((h) => h.accountType === filter);
  });

  selectClient(clientId: string): void {
    this.selectedClientId.set(clientId);
  }

  setFilter(filter: HoldingFilter): void {
    this.holdingFilter.set(filter);
  }

  toggleCurrency(currency: 'INR' | 'USD'): void {
    this.viewCurrency.set(currency);
  }

  /** Converts an INR figure to the currently selected view currency, formatted for display. */
  formatAmount(inr: number): string {
    if (this.viewCurrency() === 'USD') {
      const usd = inr / this.nri.usdInrRate;
      return '$' + this.compact(usd);
    }
    return '₹' + this.compact(inr);
  }

  private compact(value: number): string {
    const abs = Math.abs(value);
    if (abs >= 1_00_00_000) return (value / 1_00_00_000).toFixed(2) + (this.viewCurrency() === 'USD' ? 'M' : ' Cr');
    if (abs >= 1_00_000) return (value / 1_00_000).toFixed(2) + (this.viewCurrency() === 'USD' ? 'M' : ' L');
    if (abs >= 1_000) return (value / 1_000).toFixed(2) + 'K';
    return value.toFixed(0);
  }
}
