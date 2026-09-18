import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MOCK_FX_RATES,
  MOCK_FX_TREND,
  MOCK_PORTFOLIO_BALANCES,
  MOCK_SETTLEMENT_RULES,
} from '../institutional-data.mock';

@Component({
  selector: 'app-currency-fx',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './currency-fx.component.html',
})
export class CurrencyFxComponent {
  readonly rates = MOCK_FX_RATES;
  readonly settlementRules = MOCK_SETTLEMENT_RULES;
  readonly balances = MOCK_PORTFOLIO_BALANCES;

  readonly timeRanges = ['1M', '3M', '1Y'];
  selectedRange = '1M';

  readonly totalInrEq = this.balances.reduce((sum, b) => sum + b.baseEqInr, 0);

  readonly trendPath = this.buildPath(MOCK_FX_TREND.map((p) => p.rate));

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
