import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { SchemeService } from '../../../core/services/scheme.service';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';

const ASSET_CLASS_BETA: Record<string, number> = {
  Equity: 1.18,
  Debt: 0.25,
  Hybrid: 0.65,
  Gold: 0.05,
  'Fixed Income': 0.2,
  Cash: 0.02,
};

@Component({
  selector: 'app-portfolio-overview',
  standalone: true,
  imports: [CommonModule, RouterLink, StatCardComponent, InrCompactPipe],
  templateUrl: './portfolio-overview.component.html',
})
export class PortfolioOverviewComponent {
  readonly portfolio = inject(PortfolioService);
  private readonly schemeService = inject(SchemeService);

  readonly timeRanges = ['YTD', '1Y', '3Y', '5Y'];
  selectedRange = '1Y';

  readonly chartPath = this.buildPath(this.portfolio.growthSeries.map((p) => p.value));
  readonly benchmarkPath = this.buildPath(this.portfolio.growthSeries.map((p) => p.benchmark ?? 0));

  readonly allocationSegments = computed(() => {
    let cumulative = 0;
    return this.portfolio.assetAllocation().map((a) => {
      const start = cumulative;
      cumulative += a.pct;
      return { ...a, start, end: cumulative };
    });
  });

  readonly donutGradient = computed(() =>
    this.allocationSegments()
      .map((seg) => `var(${seg.colorVar}) ${seg.start}% ${seg.end}%`)
      .join(', '),
  );

  readonly topMovers = computed(() => {
    const totalValue = this.portfolio.currentValue();
    if (totalValue <= 0) return [];
    return this.portfolio
      .holdings()
      .map((h) => {
        const scheme = this.schemeService.getById(h.schemeId);
        const weightPct = (h.currentValue / totalValue) * 100;
        const returnPct = scheme?.returns1y ?? h.unrealizedPlPct;
        const contributionPct = (weightPct * returnPct) / 100;
        return { schemeName: h.schemeName, weightPct, returnPct, contributionPct };
      })
      .sort((a, b) => Math.abs(b.contributionPct) - Math.abs(a.contributionPct))
      .slice(0, 5);
  });

  readonly portfolioBeta = computed(() => {
    const weighted = this.portfolio.assetAllocation().reduce((sum, a) => sum + a.pct * (ASSET_CLASS_BETA[a.label] ?? 0.5), 0);
    return Number((weighted / 100).toFixed(2));
  });

  readonly betaStatus = computed<'Normal' | 'Elevated'>(() => (this.portfolioBeta() > 1.05 ? 'Elevated' : 'Normal'));
  // Gauge arc: stroke-dasharray total length 100, offset represents (1 - fraction) of arc filled.
  readonly betaGaugeOffset = computed(() => Math.max(0, 100 - Math.min(this.portfolioBeta() / 1.6, 1) * 100));

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
