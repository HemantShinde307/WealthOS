import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClientService } from '../../../core/services/client.service';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';
import { AT_RISK_ASSETS, HIGH_IMPACT_INFLOWS, PORTFOLIO_AUM_TREND } from '../advisor-mock-data';
import { Client } from '../../../core/models/domain.models';

const SEGMENT_COLOR_VARS: Record<Client['segment'], string> = {
  HNI: '--color-primary-container',
  Retail: '--color-secondary',
  Corporate: '--color-on-tertiary-container',
  NRI: '--color-tertiary-container',
  'Family Office': '--color-outline-variant',
};

@Component({
  selector: 'app-advisor-portfolio',
  standalone: true,
  imports: [CommonModule, RouterLink, InrCompactPipe],
  templateUrl: './portfolio.component.html',
})
export class AdvisorPortfolioComponent {
  readonly clientService = inject(ClientService);
  readonly trend = PORTFOLIO_AUM_TREND;
  readonly highImpactInflows = HIGH_IMPACT_INFLOWS;
  readonly atRiskAssets = AT_RISK_ASSETS;

  readonly aumPath = this.buildPath(this.trend.map((p) => p.aum));
  readonly benchmarkPath = this.buildPath(this.trend.map((p) => p.benchmark));

  readonly segmentAllocation = computed(() => {
    const clients = this.clientService.clients();
    const total = clients.reduce((s, c) => s + c.aum, 0) || 1;
    const bySegment = new Map<Client['segment'], number>();
    for (const c of clients) {
      bySegment.set(c.segment, (bySegment.get(c.segment) ?? 0) + c.aum);
    }
    let cumulative = 0;
    return [...bySegment.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([segment, aum]) => {
        const pct = Math.round((aum / total) * 1000) / 10;
        const start = cumulative;
        cumulative += pct;
        return { segment, aum, pct, start, end: cumulative, colorVar: SEGMENT_COLOR_VARS[segment] };
      });
  });

  readonly donutGradient = computed(() =>
    this.segmentAllocation()
      .map((s) => `var(${s.colorVar}) ${s.start}% ${s.end}%`)
      .join(', '),
  );

  readonly avgAumPerClient = computed(() => {
    const clients = this.clientService.clients();
    return clients.length ? this.clientService.totalAum() / clients.length : 0;
  });

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
