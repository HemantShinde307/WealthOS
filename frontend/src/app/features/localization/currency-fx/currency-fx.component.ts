import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CURRENCY_ACCOUNT_BALANCES,
  CURRENCY_SYMBOLS,
  FX_RATES,
  SETTLEMENT_RULES,
  SUPPORTED_CURRENCIES,
  USD_INR_TREND,
  SettlementRule,
} from './currency-fx.mock';

@Component({
  selector: 'app-currency-fx',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './currency-fx.component.html',
})
export class CurrencyFxComponent {
  readonly currencies = SUPPORTED_CURRENCIES;
  readonly fxRates = FX_RATES;
  readonly currencySymbols = CURRENCY_SYMBOLS;
  readonly balances = CURRENCY_ACCOUNT_BALANCES;

  readonly baseCurrency = signal('INR');
  readonly autoConversion = signal(true);
  readonly rules = signal<SettlementRule[]>(SETTLEMENT_RULES);

  readonly ranges = ['1M', '3M', '1Y'] as const;
  readonly selectedRange = signal<(typeof this.ranges)[number]>('1M');

  readonly totalBaseEquivalent = computed(() => this.balances.reduce((sum, b) => sum + b.baseEquivalent, 0));

  readonly trendPath = computed(() => this.buildPath(USD_INR_TREND));
  readonly trendFillPath = computed(() => `${this.trendPath()} L100,100 L0,100 Z`);

  setRange(range: (typeof this.ranges)[number]): void {
    this.selectedRange.set(range);
  }

  toggleRule(rule: SettlementRule): void {
    this.rules.update((list) => list.map((r) => (r.id === rule.id ? { ...r, active: !r.active } : r)));
  }

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
