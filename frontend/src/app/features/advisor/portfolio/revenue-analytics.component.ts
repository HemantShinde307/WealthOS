import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClientService } from '../../../core/services/client.service';
import { CommissionService } from '../../../core/services/commission.service';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';
import { COMMISSION_TREND, REVENUE_MIX } from '../advisor-mock-data';

@Component({
  selector: 'app-revenue-analytics',
  standalone: true,
  imports: [CommonModule, RouterLink, InrCompactPipe],
  templateUrl: './revenue-analytics.component.html',
})
export class RevenueAnalyticsComponent {
  readonly clientService = inject(ClientService);
  readonly commissionService = inject(CommissionService);

  readonly trend = COMMISSION_TREND;
  readonly revenueMix = REVENUE_MIX;

  readonly topRevenueClients = computed(() =>
    [...this.clientService.clients()]
      .sort((a, b) => b.aum - a.aum)
      .slice(0, 5)
      .map((c) => ({ client: c, estMonthlyRevenue: Math.round((c.aum * 0.0075) / 12) })),
  );

  private cumulative(values: number[]): number[] {
    let sum = 0;
    return values.map((v) => (sum += v));
  }

  readonly aumRevenuePath = this.buildPath(this.cumulative(this.trend.map((p) => p.base)));
  readonly incentivePath = this.buildPath(this.cumulative(this.trend.map((p) => p.incentive)));

  readonly donutGradient = (() => {
    let cumulative = 0;
    return this.revenueMix
      .map((m) => {
        const start = cumulative;
        cumulative += m.pct;
        return `var(${m.colorVar}) ${start}% ${cumulative}%`;
      })
      .join(', ');
  })();

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
