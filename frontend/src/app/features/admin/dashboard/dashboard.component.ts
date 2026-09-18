import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClientService } from '../../../core/services/client.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { KycService } from '../../../core/services/kyc.service';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';
import { PLATFORM_AUM_TREND, RECONCILIATION_BREAKS } from '../admin-data.mock';

const SEGMENT_COLOR_VARS: Record<string, string> = {
  Retail: '--color-primary-container',
  HNI: '--color-secondary',
  Corporate: '--color-tertiary-fixed-dim',
  NRI: '--color-secondary-fixed-dim',
  'Family Office': '--color-error-container',
};

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatCardComponent, InrCompactPipe],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  readonly clientService = inject(ClientService);
  readonly transactionService = inject(TransactionService);
  readonly kycService = inject(KycService);

  readonly reconciliationBreaks = RECONCILIATION_BREAKS;
  readonly aumTrend = PLATFORM_AUM_TREND;

  readonly totalAum = this.clientService.totalAum;
  readonly activeClientCount = computed(() => this.clientService.clients().length);

  readonly pendingKyc = computed(() =>
    this.kycService.records().filter((r) => r.status === 'Pending' || r.status === 'In Review'),
  );

  readonly failedTransactions = computed(() => this.transactionService.transactions().filter((t) => t.status === 'Failed'));
  readonly recentOrders = computed(() => this.transactionService.recent(6));

  readonly monthlyNetInflowCr = this.aumTrend[this.aumTrend.length - 1].netFlowCr;
  readonly aumMoMChangePct = (() => {
    const last = this.aumTrend[this.aumTrend.length - 1].aumCr;
    const prev = this.aumTrend[this.aumTrend.length - 2].aumCr;
    return Number((((last - prev) / prev) * 100).toFixed(1));
  })();

  readonly chartPath = this.buildPath(this.aumTrend.map((p) => p.aumCr));

  readonly segmentAllocation = computed(() => {
    const clients = this.clientService.clients();
    const total = clients.reduce((sum, c) => sum + c.aum, 0) || 1;
    const bySegment = new Map<string, number>();
    for (const c of clients) {
      bySegment.set(c.segment, (bySegment.get(c.segment) ?? 0) + c.aum);
    }
    let cumulative = 0;
    return Array.from(bySegment.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, aum]) => {
        const pct = Number(((aum / total) * 100).toFixed(1));
        const start = cumulative;
        cumulative += pct;
        return { label, pct, start, end: cumulative, colorVar: SEGMENT_COLOR_VARS[label] ?? '--color-outline-variant' };
      });
  });

  readonly donutGradient = computed(() =>
    this.segmentAllocation()
      .map((seg) => `var(${seg.colorVar}) ${seg.start}% ${seg.end}%`)
      .join(', '),
  );

  statusBadgeClass(status: string): string {
    switch (status) {
      case 'Completed':
        return 'bg-tertiary-fixed-dim/20 text-on-tertiary-fixed-variant';
      case 'Failed':
        return 'bg-error-container text-on-error-container';
      case 'Pending':
      case 'Processing':
        return 'bg-surface-variant text-on-surface-variant';
      default:
        return 'bg-surface-container-low text-on-surface-variant';
    }
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
