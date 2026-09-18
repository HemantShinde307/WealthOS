import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TransactionService } from '../../../core/services/transaction.service';
import { ClientService } from '../../../core/services/client.service';
import { CommissionService } from '../../../core/services/commission.service';
import {
  REGULATORY_REPORT_TEMPLATES,
  REGULATORY_FILINGS,
  RegulatoryFiling,
  RegulatoryReportTemplate,
} from '../admin-data.mock';

let nextReportSeq = 9923;

@Component({
  selector: 'app-regulatory-reporting',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './regulatory-reporting.component.html',
})
export class RegulatoryReportingComponent {
  private readonly transactionService = inject(TransactionService);
  private readonly clientService = inject(ClientService);
  private readonly commissionService = inject(CommissionService);

  readonly templates = REGULATORY_REPORT_TEMPLATES;
  readonly filings = signal<RegulatoryFiling[]>(REGULATORY_FILINGS);

  readonly dateFrom = signal('2026-07-01');
  readonly dateTo = signal('2026-09-30');
  readonly branchHierarchy = signal('All Branches (Consolidated)');
  readonly distributorCode = signal('');

  // Real record counts backing each template card, pulled from shared services.
  readonly templateRecordCounts: Record<string, number> = {
    'trail-commission': this.commissionService.entries().length,
    'aum-disclosure': this.clientService.clients().length,
    'transaction-audit-log': this.transactionService.transactions().length,
  };

  readonly sortedFilings = computed(() => [...this.filings()].sort((a, b) => (a.generatedOn < b.generatedOn ? 1 : -1)));

  initializeReport(template: RegulatoryReportTemplate): void {
    const now = new Date();
    const generatedOn = now.toLocaleString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
    const filing: RegulatoryFiling = {
      reportId: `REP-${nextReportSeq++}`,
      templateId: template.id,
      templateName: template.name,
      period: `${this.dateFrom()} to ${this.dateTo()}`,
      generatedOn,
      status: 'Processing',
    };
    this.filings.update((list) => [filing, ...list]);
  }

  statusBadgeClass(status: string): string {
    switch (status) {
      case 'Uploaded':
        return 'bg-tertiary-fixed-dim/20 text-on-tertiary-fixed-variant';
      case 'Validation Failed':
        return 'bg-error-container text-on-error-container';
      case 'Processing':
        return 'bg-secondary-container/20 text-secondary';
      default:
        return 'bg-surface-variant text-on-surface-variant';
    }
  }
}
