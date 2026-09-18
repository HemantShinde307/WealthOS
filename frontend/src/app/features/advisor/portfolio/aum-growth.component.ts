import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AT_RISK_ASSETS, AUM_MOVEMENT, HIGH_IMPACT_INFLOWS } from '../advisor-mock-data';

@Component({
  selector: 'app-aum-growth',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './aum-growth.component.html',
})
export class AumGrowthComponent {
  readonly movement = AUM_MOVEMENT;
  readonly highImpactInflows = HIGH_IMPACT_INFLOWS;
  readonly atRiskAssets = AT_RISK_ASSETS;

  readonly maxAbs = Math.max(...this.movement.map((m) => Math.abs(m.value)));

  barHeight(value: number): number {
    return Math.max(8, (Math.abs(value) / this.maxAbs) * 100);
  }

  barColorClass(kind: 'total' | 'in' | 'out'): string {
    switch (kind) {
      case 'in':
        return 'bg-on-tertiary-container';
      case 'out':
        return 'bg-error';
      default:
        return 'bg-primary-container';
    }
  }
}
