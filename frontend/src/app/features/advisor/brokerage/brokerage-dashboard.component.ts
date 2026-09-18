import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CommissionService } from '../../../core/services/commission.service';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';
import { COMMISSION_TREND, PAYOUT_BATCHES } from '../advisor-mock-data';

@Component({
  selector: 'app-brokerage-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, InrCompactPipe],
  templateUrl: './brokerage-dashboard.component.html',
})
export class BrokerageDashboardComponent {
  readonly commissionService = inject(CommissionService);
  readonly trend = COMMISSION_TREND;
  readonly recentPayouts = PAYOUT_BATCHES.slice(0, 4);

  readonly basePath = this.buildPath(this.trend.map((p) => p.base));
  readonly incentivePath = this.buildPath(this.trend.map((p) => p.incentive));

  private buildPath(values: number[]): string {
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const points = values.map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = 100 - ((v - min) / range) * 90 - 5;
      return `${x},${y.toFixed(1)}`;
    });
    return `M${points.join(' L')}`;
  }
}
