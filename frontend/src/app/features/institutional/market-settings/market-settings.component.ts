import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MOCK_MARKET_PROFILES, MOCK_MARKET_READINESS } from '../institutional-data.mock';

@Component({
  selector: 'app-market-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './market-settings.component.html',
})
export class MarketSettingsComponent {
  readonly profiles = MOCK_MARKET_PROFILES;
  readonly readiness = MOCK_MARKET_READINESS;

  statusIconClass(status: string): string {
    switch (status) {
      case 'live':
        return 'text-on-tertiary-container';
      case 'in-progress':
        return 'text-warning';
      default:
        return 'text-on-surface-variant';
    }
  }

  statusIcon(status: string): string {
    switch (status) {
      case 'live':
        return 'check_circle';
      case 'in-progress':
        return 'schedule';
      default:
        return 'radio_button_unchecked';
    }
  }

  barClass(status: string): string {
    switch (status) {
      case 'live':
        return 'bg-on-tertiary-container';
      case 'in-progress':
        return 'bg-warning';
      default:
        return 'bg-outline-variant';
    }
  }
}
