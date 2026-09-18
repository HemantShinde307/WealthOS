import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CONVERSION_FUNNEL, LEAD_INFLOW_SERIES } from '../advisor-mock-data';

@Component({
  selector: 'app-lead-analytics',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './lead-analytics.component.html',
})
export class LeadAnalyticsComponent {
  readonly funnel = CONVERSION_FUNNEL;
  readonly inflow = LEAD_INFLOW_SERIES;

  readonly inflowPath = this.buildPath(this.inflow);

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

  conversionRate(i: number): number {
    if (i === 0) return 0;
    const prev = this.funnel[i - 1].value;
    return prev ? Math.round((this.funnel[i].value / prev) * 1000) / 10 : 0;
  }
}
