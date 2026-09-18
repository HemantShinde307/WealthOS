import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';

const HORIZON_YEARS = 10;
const ANNUAL_RETURN = 0.115;

@Component({
  selector: 'app-monte-carlo',
  standalone: true,
  imports: [CommonModule, InrCompactPipe],
  templateUrl: './monte-carlo.component.html',
})
export class MonteCarloComponent {
  readonly targetCapital = 4_500_000;
  readonly simulatedPaths = 10_000;
  readonly horizonYears = HORIZON_YEARS;

  readonly initialCapital = signal(2_000_000);
  readonly monthlyContribution = signal(15_000);
  readonly volatilityStress = signal(15);
  private readonly recalcSeed = signal(0);

  readonly years = Array.from({ length: HORIZON_YEARS + 1 }, (_, i) => i);

  readonly medianSeries = computed(() => this.buildMedianSeries());
  readonly upperSeries = computed(() => this.buildBandSeries(1));
  readonly lowerSeries = computed(() => this.buildBandSeries(-1));
  readonly innerUpperSeries = computed(() => this.buildBandSeries(0.5));
  readonly innerLowerSeries = computed(() => this.buildBandSeries(-0.5));

  readonly chartScale = computed(() => {
    const all = [...this.upperSeries(), ...this.lowerSeries(), this.targetCapital];
    return { min: 0, max: Math.max(...all) * 1.05 };
  });

  readonly medianPath = computed(() => this.buildLinePath(this.medianSeries()));
  readonly upperPath = computed(() => this.buildLinePath(this.upperSeries()));
  readonly lowerPath = computed(() => this.buildLinePath(this.lowerSeries()));
  readonly outerBandPath = computed(() => this.buildAreaPath(this.upperSeries(), this.lowerSeries()));
  readonly innerBandPath = computed(() => this.buildAreaPath(this.innerUpperSeries(), this.innerLowerSeries()));
  readonly targetLineY = computed(() => this.valueToY(this.targetCapital));

  readonly probabilityOfSuccess = computed(() => {
    const median = this.medianSeries()[this.horizonYears];
    const spread = (this.upperSeries()[this.horizonYears] - this.lowerSeries()[this.horizonYears]) / 2 || 1;
    const z = (median - this.targetCapital) / spread;
    const pct = 50 + z * 32;
    return Math.min(99, Math.max(2, Math.round(pct * 10) / 10));
  });

  readonly percentile95 = computed(() => this.upperSeries()[this.horizonYears]);
  readonly percentile50 = computed(() => this.medianSeries()[this.horizonYears]);
  readonly percentile5 = computed(() => this.lowerSeries()[this.horizonYears]);

  recalculate(): void {
    this.recalcSeed.update((s) => s + 1);
  }

  onInitialCapitalChange(value: string): void {
    this.initialCapital.set(Number(value));
  }

  onMonthlyContributionChange(value: string): void {
    this.monthlyContribution.set(Number(value));
  }

  onVolatilityChange(value: string): void {
    this.volatilityStress.set(Number(value));
  }

  private buildMedianSeries(): number[] {
    const seedJitter = 1 + (Math.sin(this.recalcSeed()) * 0.01);
    const monthly = this.monthlyContribution();
    const initial = this.initialCapital();
    return this.years.map((t) => {
      const growth = Math.pow(1 + ANNUAL_RETURN, t);
      const contributionsFv = t === 0 ? 0 : monthly * 12 * ((growth - 1) / ANNUAL_RETURN);
      return (initial * growth + contributionsFv) * seedJitter;
    });
  }

  private buildBandSeries(direction: number): number[] {
    const median = this.buildMedianSeries();
    const volFactor = (this.volatilityStress() / 100) * 0.95;
    return median.map((v, t) => {
      const spread = volFactor * Math.sqrt(t / this.horizonYears || 0.001) * 1.4;
      return Math.max(0, v * (1 + direction * spread));
    });
  }

  private valueToY(value: number): number {
    const { min, max } = this.chartScale();
    const range = max - min || 1;
    return 100 - ((value - min) / range) * 95 - 2;
  }

  private buildLinePath(values: number[]): string {
    const points = values.map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = this.valueToY(v);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    });
    return `M${points.join(' L')}`;
  }

  private buildAreaPath(top: number[], bottom: number[]): string {
    const n = top.length;
    const topPoints = top.map((v, i) => `${((i / (n - 1)) * 100).toFixed(2)},${this.valueToY(v).toFixed(2)}`);
    const bottomPoints = bottom
      .map((v, i) => `${((i / (n - 1)) * 100).toFixed(2)},${this.valueToY(v).toFixed(2)}`)
      .reverse();
    return `M${topPoints.join(' L')} L${bottomPoints.join(' L')} Z`;
  }
}
