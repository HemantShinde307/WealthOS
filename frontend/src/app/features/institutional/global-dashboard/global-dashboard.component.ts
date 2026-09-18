import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MOCK_GLOBAL_ACTIVITY,
  MOCK_GLOBAL_INDICES,
  MOCK_GLOBAL_OPERATIONS,
  MOCK_GLOBAL_REGIONS,
} from '../institutional-data.mock';

@Component({
  selector: 'app-global-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './global-dashboard.component.html',
})
export class GlobalDashboardComponent {
  readonly timeRanges = ['1D', '1W', '1M', '1Y'];
  selectedRange = '1M';

  readonly regions = MOCK_GLOBAL_REGIONS;
  readonly indices = MOCK_GLOBAL_INDICES;
  readonly operations = MOCK_GLOBAL_OPERATIONS;
  readonly activity = MOCK_GLOBAL_ACTIVITY;

  readonly totalAum = '$142.8B';
  readonly aumChangeLabel = '+2.4% vs Last Quarter';
  readonly totalClients = 2723;
  readonly activeOnboarding = 142;

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
