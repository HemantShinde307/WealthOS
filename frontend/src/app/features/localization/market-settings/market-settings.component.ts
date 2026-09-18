import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MARKET_HOLIDAYS, MARKET_PROFILES, MARKET_READINESS, MarketProfile } from './market-settings.mock';

@Component({
  selector: 'app-market-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './market-settings.component.html',
})
export class MarketSettingsComponent {
  readonly readiness = MARKET_READINESS;
  readonly holidays = MARKET_HOLIDAYS;
  readonly profiles = signal<MarketProfile[]>(MARKET_PROFILES);

  readonly activeCount = computed(() => this.profiles().filter((p) => p.status === 'active').length);

  readonly statusIcon: Record<string, string> = {
    complete: 'check_circle',
    'in-progress': 'pending',
    'not-started': 'radio_button_unchecked',
  };
  readonly statusColor: Record<string, string> = {
    complete: 'text-on-tertiary-container',
    'in-progress': 'text-gold',
    'not-started': 'text-on-surface-variant',
  };
  readonly barColor: Record<string, string> = {
    complete: 'bg-on-tertiary-container',
    'in-progress': 'bg-gold',
    'not-started': 'bg-outline-variant',
  };

  toggleTradingHours(profile: MarketProfile): void {
    this.profiles.update((list) =>
      list.map((p) => (p.countryCode === profile.countryCode ? { ...p, tradingHoursEnabled: !p.tradingHoursEnabled } : p)),
    );
  }

  holidaysFor(countryCode: string): number {
    return this.holidays.filter((h) => h.countryCode === countryCode).length;
  }
}
