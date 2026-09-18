import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';

@Component({
  selector: 'app-portfolio-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatCardComponent, InrCompactPipe],
  templateUrl: './portfolio-dashboard.component.html',
})
export class PortfolioDashboardComponent {
  readonly portfolio = inject(PortfolioService);

  readonly timeRanges = ['1M', '3M', '6M', '1Y'];
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
