import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommissionService } from '../../../core/services/commission.service';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';

interface AdvisorSummary {
  advisorName: string;
  totalCommission: number;
  transactionCount: number;
}

@Component({
  selector: 'app-brokerage',
  standalone: true,
  imports: [CommonModule, InrCompactPipe],
  templateUrl: './brokerage.component.html',
})
export class BrokerageComponent {
  private readonly commissionService = inject(CommissionService);

  readonly entries = this.commissionService.entries;
  readonly totalPaid = this.commissionService.totalPaid;
  readonly totalPending = this.commissionService.totalPending;

  readonly totalTransactionVolume = computed(() => this.entries().reduce((s, e) => s + e.transactionAmount, 0));

  readonly advisorSummaries = computed<AdvisorSummary[]>(() => {
    const map = new Map<string, AdvisorSummary>();
    for (const e of this.entries()) {
      const row = map.get(e.advisorName) ?? { advisorName: e.advisorName, totalCommission: 0, transactionCount: 0 };
      row.totalCommission += e.commissionAmount;
      row.transactionCount += 1;
      map.set(e.advisorName, row);
    }
    return [...map.values()].sort((a, b) => b.totalCommission - a.totalCommission);
  });

  statusBadgeClass(status: string): string {
    switch (status) {
      case 'Paid':
        return 'bg-success/10 text-success border-success/20';
      case 'Processing':
        return 'bg-primary/10 text-primary border-primary/20';
      default:
        return 'bg-secondary/10 text-secondary border-secondary/20';
    }
  }
}
