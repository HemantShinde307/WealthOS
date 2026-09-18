import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FIXED_INCOME_INSTRUMENTS } from '../fixed-income/fixed-income-data';

interface HeldPosition {
  instrumentId: string;
  units: number;
}

@Component({
  selector: 'app-fixed-income-analytics',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './fixed-income-analytics.component.html',
})
export class FixedIncomeAnalyticsComponent {
  private readonly holdings: HeldPosition[] = [
    { instrumentId: 'FI-01', units: 25 },
    { instrumentId: 'FI-03', units: 15 },
    { instrumentId: 'FI-02', units: 100 },
  ];

  readonly positions = this.holdings.map((h) => {
    const instrument = FIXED_INCOME_INSTRUMENTS.find((i) => i.id === h.instrumentId)!;
    const value = instrument.faceValue * h.units;
    return { instrument, units: h.units, value };
  });

  readonly totalValue = this.positions.reduce((sum, p) => sum + p.value, 0);
  readonly weightedYield = Number(
    (this.positions.reduce((sum, p) => sum + p.instrument.yieldPct * p.value, 0) / this.totalValue).toFixed(2),
  );
  readonly annualIncome = Math.round(this.positions.reduce((sum, p) => sum + (p.instrument.yieldPct / 100) * p.value, 0));
  readonly avgTenureMonths = Math.round(this.positions.reduce((sum, p) => sum + p.instrument.tenureMonths * p.value, 0) / this.totalValue);

  readonly byType = (() => {
    const map = new Map<string, number>();
    for (const p of this.positions) {
      map.set(p.instrument.type, (map.get(p.instrument.type) ?? 0) + p.value);
    }
    return Array.from(map.entries()).map(([type, value]) => ({ type, value, pct: Math.round((value / this.totalValue) * 100) }));
  })();
}
