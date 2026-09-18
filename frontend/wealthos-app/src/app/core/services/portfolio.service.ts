import { Injectable, signal, computed } from '@angular/core';
import { Holding, NavPoint } from '../models/domain.models';
import { MOCK_HOLDINGS, MOCK_ASSET_ALLOCATION } from '../mock-data/holdings.mock';

function buildGrowthSeries(): NavPoint[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const portfolio = [37.5, 38.2, 39.1, 40.6, 41.0, 42.3, 43.8, 44.2, 45.1, 46.0, 46.8, 47.5];
  const benchmark = [35.0, 35.6, 36.2, 37.0, 37.4, 38.5, 39.6, 40.1, 40.8, 41.5, 42.0, 42.6];
  return months.map((date, i) => ({ date, value: portfolio[i], benchmark: benchmark[i] }));
}

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private readonly _holdings = signal<Holding[]>(MOCK_HOLDINGS);
  readonly holdings = this._holdings.asReadonly();
  readonly assetAllocation = MOCK_ASSET_ALLOCATION;
  readonly growthSeries = buildGrowthSeries();

  readonly currentValue = computed(() => this._holdings().reduce((sum, h) => sum + h.currentValue, 0));
  readonly investedValue = computed(() => this._holdings().reduce((sum, h) => sum + h.investedValue, 0));
  readonly unrealizedPl = computed(() => this.currentValue() - this.investedValue());
  readonly absoluteReturnPct = computed(() => Number(((this.unrealizedPl() / this.investedValue()) * 100).toFixed(2)));
  readonly xirr = 14.2;
}
