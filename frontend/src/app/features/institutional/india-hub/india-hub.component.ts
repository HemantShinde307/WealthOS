import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MOCK_INDIA_ACTIVITY,
  MOCK_INDIA_CITIES,
  MOCK_INDIA_INDICES,
  MOCK_INDIA_OPERATIONS,
} from '../institutional-data.mock';

@Component({
  selector: 'app-india-hub',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './india-hub.component.html',
})
export class IndiaHubComponent {
  readonly timeRanges = ['1D', '1W', '1M', '1Y'];
  selectedRange = '1M';

  readonly cities = MOCK_INDIA_CITIES;
  readonly indices = MOCK_INDIA_INDICES;
  readonly operations = MOCK_INDIA_OPERATIONS;
  readonly activity = MOCK_INDIA_ACTIVITY;

  readonly totalAum = '₹1,18,540 Cr';
  readonly aumChangeLabel = '+3.1% vs Last Quarter';
  readonly totalClients = 3145;
  readonly activeOnboarding = 218;

  statusClass(status: string): string {
    switch (status) {
      case 'Compliant':
        return 'bg-tertiary-container text-on-tertiary-container';
      case 'Review Required':
        return 'bg-error-container text-on-error-container';
      default:
        return 'bg-secondary-fixed text-on-secondary-fixed';
    }
  }

  toneIconClass(tone: 'info' | 'success' | 'error'): string {
    switch (tone) {
      case 'success':
        return 'bg-tertiary-container text-on-tertiary-container';
      case 'error':
        return 'bg-error-container text-error';
      default:
        return 'bg-surface-container-high text-secondary';
    }
  }
}
