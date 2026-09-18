import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';

@Component({
  selector: 'app-advanced-analytics',
  standalone: true,
  imports: [CommonModule, InrCompactPipe],
  templateUrl: './advanced-analytics.component.html',
})
export class AdvancedAnalyticsComponent {
  private readonly portfolio = inject(PortfolioService);

  readonly currentValue = this.portfolio.currentValue;
  readonly investedValue = this.portfolio.investedValue;
  readonly absoluteReturnPct = this.portfolio.absoluteReturnPct;
  readonly xirr = this.portfolio.xirr;

  readonly growthSeries = this.portfolio.growthSeries;
  readonly chartPath = this.buildPath(this.growthSeries.map((p) => p.value));
  readonly benchmarkPath = this.buildPath(this.growthSeries.map((p) => p.benchmark ?? 0));

  readonly rankedHoldings = computed(() => [...this.portfolio.holdings()].sort((a, b) => b.unrealizedPlPct - a.unrealizedPlPct));
  readonly bestPerformer = computed(() => this.rankedHoldings()[0]);
  readonly worstPerformer = computed(() => this.rankedHoldings()[this.rankedHoldings().length - 1]);

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
