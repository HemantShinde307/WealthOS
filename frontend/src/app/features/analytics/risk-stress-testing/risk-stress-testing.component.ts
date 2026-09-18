import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { SchemeService } from '../../../core/services/scheme.service';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';
import { STRESS_SCENARIOS, CORRELATION_ASSET_CLASSES, CORRELATION_MATRIX, StressScenario } from '../analytics-data.mock';

const ASSET_CLASS_BETA: Record<string, number> = {
  Equity: 1.18,
  Debt: 0.25,
  Hybrid: 0.65,
  Gold: 0.05,
  'Fixed Income': 0.2,
  Cash: 0.02,
};

@Component({
  selector: 'app-risk-stress-testing',
  standalone: true,
  imports: [CommonModule, InrCompactPipe],
  templateUrl: './risk-stress-testing.component.html',
})
export class RiskStressTestingComponent {
  readonly portfolio = inject(PortfolioService);
  private readonly schemeService = inject(SchemeService);

  readonly scenarios = STRESS_SCENARIOS;
  readonly selectedScenarioId = signal(this.scenarios[0].id);
  readonly selectedScenario = computed<StressScenario>(
    () => this.scenarios.find((s) => s.id === this.selectedScenarioId()) ?? this.scenarios[0],
  );

  readonly correlationClasses = CORRELATION_ASSET_CLASSES;
  readonly correlationMatrix = CORRELATION_MATRIX;

  readonly currentValue = this.portfolio.currentValue();

  readonly varOneDay = this.currentValue * 0.018;
  readonly varHistorical = this.currentValue * 0.021;
  readonly varMonteCarlo = this.currentValue * 0.0175;
  readonly varConditional = this.currentValue * 0.028;

  readonly stressedValue = computed(() => this.currentValue * (1 + this.selectedScenario().pnlImpactPct / 100));
  readonly pnlImpactValue = computed(() => this.currentValue * (this.selectedScenario().pnlImpactPct / 100));

  readonly stressBars = computed(() => {
    const scenario = this.selectedScenario();
    let running = this.currentValue;
    const bars: { label: string; value: number; kind: 'base' | 'positive' | 'negative' }[] = [
      { label: 'Start Value', value: this.currentValue, kind: 'base' },
    ];
    for (const impact of scenario.assetImpacts) {
      const delta = (this.currentValue * impact.pct) / 100 / scenario.assetImpacts.length;
      running += delta;
      bars.push({ label: impact.label, value: Math.abs(delta), kind: impact.pct >= 0 ? 'positive' : 'negative' });
    }
    bars.push({ label: 'Stressed Value', value: this.stressedValue(), kind: 'base' });
    return bars;
  });

  readonly chartMax = computed(() => Math.max(...this.stressBars().map((b) => b.value)) * 1.1);

  barHeightPct(value: number): number {
    return (value / this.chartMax()) * 100;
  }

  readonly marginalVarContributors = (() => {
    const totalValue = this.portfolio.currentValue();
    return this.portfolio
      .holdings()
      .map((h) => {
        const scheme = this.schemeService.getById(h.schemeId);
        const weightPct = (h.currentValue / totalValue) * 100;
        const beta = ASSET_CLASS_BETA[scheme?.assetClass ?? 'Equity'] ?? 0.5;
        const marginalVar = (h.currentValue * beta * 0.02);
        return { schemeName: h.schemeName, category: h.category, weightPct, beta, marginalVar };
      })
      .sort((a, b) => b.marginalVar - a.marginalVar);
  })();

  correlationCellClass(value: number): string {
    if (value === 1) return 'bg-on-background text-on-primary';
    if (value >= 0.4) return 'bg-error/20 text-error';
    if (value <= -0.2) return 'bg-on-tertiary-container/20 text-on-tertiary-container';
    return 'bg-surface-container-low text-on-surface';
  }

  selectScenario(id: string): void {
    this.selectedScenarioId.set(id);
  }
}
