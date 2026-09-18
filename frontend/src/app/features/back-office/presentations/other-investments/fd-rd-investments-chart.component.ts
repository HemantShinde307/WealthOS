import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PresentationsService } from '../presentations.service';
import { ReportHeaderComponent } from '../shared/report-header.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { InrCompactPipe } from '../../../../shared/pipes/inr-compact.pipe';
import { buildDonutSegments, donutGradient } from '../shared/chart-utils';

@Component({
  selector: 'app-fd-rd-investments-chart',
  standalone: true,
  imports: [CommonModule, ReportHeaderComponent, StatCardComponent, InrCompactPipe],
  templateUrl: './fd-rd-investments-chart.component.html',
})
export class FdRdInvestmentsChartComponent {
  readonly presentations = inject(PresentationsService);

  readonly rows = computed(() =>
    this.presentations.fdRdInvestments().map((f) => {
      const principal = f.principal || (f.installmentAmount ?? 0) * f.tenureMonths;
      const daysHeld = Math.max((Date.now() - new Date(f.startDate).getTime()) / (24 * 60 * 60 * 1000), 1);
      const totalDays = Math.max((new Date(f.maturityDate).getTime() - new Date(f.startDate).getTime()) / (24 * 60 * 60 * 1000), 1);
      const accrued = principal + (f.maturityValue - principal) * Math.min(daysHeld / totalDays, 1);
      return { ...f, principal, accrued: Math.round(accrued), pctElapsed: Math.min(Math.round((daysHeld / totalDays) * 100), 100) };
    }),
  );

  readonly byType = computed(() => {
    const colors: Record<string, string> = { FD: '--color-primary-container', RD: '--color-secondary', Bond: '--color-tertiary-fixed-dim', 'Company Deposit': '--color-secondary-fixed-dim' };
    const buckets = new Map<string, number>();
    for (const r of this.rows()) buckets.set(r.type, (buckets.get(r.type) ?? 0) + r.accrued);
    return buildDonutSegments([...buckets.entries()].map(([label, value]) => ({ label, value, colorVar: colors[label] ?? '--color-outline' })));
  });

  readonly gradient = computed(() => donutGradient(this.byType()));
  readonly totalAccrued = computed(() => this.rows().reduce((s, r) => s + r.accrued, 0));
  readonly totalMaturity = computed(() => this.rows().reduce((s, r) => s + r.maturityValue, 0));
}
