import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ATTRIBUTION_ROWS } from '../analytics-data.mock';

interface WaterfallBar {
  label: string;
  kind: 'base' | 'positive' | 'negative';
  cumulativeStart: number;
  value: number;
}

@Component({
  selector: 'app-performance-attribution',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './performance-attribution.component.html',
})
export class PerformanceAttributionComponent {
  readonly periods = ['QTD', 'YTD', '1Y', '3Y'];
  selectedPeriod = 'YTD';

  readonly rows = ATTRIBUTION_ROWS;

  readonly portfolioReturn = 12.45;
  readonly benchmarkReturn = 9.8;
  readonly activeReturn = Number((this.portfolioReturn - this.benchmarkReturn).toFixed(2));

  readonly allocationEffect = this.rows.filter((r) => !r.isSubRow).reduce((s, r) => s + r.allocation, 0);
  readonly selectionEffect = this.rows.filter((r) => !r.isSubRow).reduce((s, r) => s + r.selection, 0);
  readonly interactionEffect = this.rows.filter((r) => !r.isSubRow).reduce((s, r) => s + r.interaction, 0);

  readonly totalPortWeight = this.rows.filter((r) => !r.isSubRow).reduce((s, r) => s + r.weightPort, 0);
  readonly totalBmWeight = this.rows.filter((r) => !r.isSubRow).reduce((s, r) => s + (r.weightBm ?? 0), 0);
  readonly totalEffect = this.rows.filter((r) => !r.isSubRow).reduce((s, r) => s + r.totalEffect, 0);

  readonly waterfall: WaterfallBar[] = (() => {
    let cursor = this.benchmarkReturn;
    const bars: WaterfallBar[] = [{ label: 'Benchmark', kind: 'base', cumulativeStart: 0, value: this.benchmarkReturn }];
    const steps: [string, number][] = [
      ['Allocation', this.allocationEffect],
      ['Selection', this.selectionEffect],
      ['Interaction', this.interactionEffect],
    ];
    for (const [label, value] of steps) {
      const start = value >= 0 ? cursor : cursor + value;
      bars.push({ label, kind: value >= 0 ? 'positive' : 'negative', cumulativeStart: start, value: Math.abs(value) });
      cursor += value;
    }
    bars.push({ label: 'Portfolio', kind: 'base', cumulativeStart: 0, value: cursor });
    return bars;
  })();

  readonly chartMax = Math.max(...this.waterfall.map((b) => b.cumulativeStart + b.value)) * 1.15;

  barHeightPct(bar: WaterfallBar): number {
    return (bar.value / this.chartMax) * 100;
  }

  barBottomPct(bar: WaterfallBar): number {
    return (bar.cumulativeStart / this.chartMax) * 100;
  }
}
