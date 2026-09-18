import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AiInsightService } from '../../../core/services/ai-insight.service';
import { FixedDepositService } from '../../../core/services/fixed-deposit.service';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';

@Component({
  selector: 'app-ai-insights',
  standalone: true,
  imports: [CommonModule, RouterLink, InrCompactPipe],
  templateUrl: './ai-insights.component.html',
})
export class AiInsightsComponent {
  readonly insight = inject(AiInsightService);
  readonly fdService = inject(FixedDepositService);

  readonly allocationSegments = [
    { key: 'equity' as const, label: 'Mutual Funds', colorVar: '--color-primary-container' },
    { key: 'debt' as const, label: 'Fixed Deposits', colorVar: '--color-secondary' },
    { key: 'gold' as const, label: 'Gold', colorVar: '--color-gold' },
    { key: 'cash' as const, label: 'Idle Cash', colorVar: '--color-outline-variant' },
  ];

  get donutGradient(): string {
    const a = this.insight.allocation();
    let cumulative = 0;
    const stops: string[] = [];
    for (const seg of this.allocationSegments) {
      const pct = a[seg.key];
      if (pct <= 0) continue;
      const start = cumulative;
      cumulative += pct;
      stops.push(`var(${seg.colorVar}) ${start}% ${cumulative}%`);
    }
    return stops.join(', ');
  }
}
