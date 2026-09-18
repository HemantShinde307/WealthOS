import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { KycService } from '../../../core/services/kyc.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import {
  REGULATORY_FILINGS,
  COMPLIANCE_CALENDAR,
  FILING_HEALTH_TREND,
  AGREEMENT_EXPIRY_COUNT,
} from '../admin-data.mock';

const LARGE_TRANSACTION_THRESHOLD = 750000;

@Component({
  selector: 'app-compliance-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatCardComponent],
  templateUrl: './compliance.component.html',
})
export class ComplianceComponent {
  readonly kycService = inject(KycService);
  private readonly transactionService = inject(TransactionService);

  readonly calendar = COMPLIANCE_CALENDAR;
  readonly trend = FILING_HEALTH_TREND;
  readonly agreementExpiryCount = AGREEMENT_EXPIRY_COUNT;

  readonly pendingFilingsCount = computed(
    () => REGULATORY_FILINGS.filter((f) => f.status === 'Pending Review' || f.status === 'Validation Failed').length,
  );

  readonly kycRenewalsDue = computed(() => this.kycService.records().filter((r) => r.status === 'Pending' || r.status === 'In Review').length);

  readonly openAuditFlags = computed(() => this.kycService.auditLog().filter((a) => a.status === 'Failure').length);

  readonly recentActivity = computed(() => this.kycService.auditLog().slice(0, 6));

  // Illustrative anomaly-detection heuristic over the existing transaction feed: flags failed
  // transactions and unusually large amounts. A production model would also weigh account-age,
  // new-payee/new-bank-account signals, and velocity — not modeled in this prototype's data.
  readonly anomalies = computed(() =>
    this.transactionService
      .transactions()
      .filter((t) => t.status === 'Failed' || t.amount >= LARGE_TRANSACTION_THRESHOLD)
      .slice(0, 4)
      .map((t) => ({
        transaction: t,
        reason: t.status === 'Failed' ? 'Transaction failed — review for repeated attempts' : `Unusually large ${t.type.toLowerCase()} (₹${t.amount.toLocaleString('en-IN')})`,
      })),
  );

  readonly maxFilings = Math.max(...this.trend.map((t) => t.filings));

  barHeightPct(filings: number): number {
    return Math.round((filings / this.maxFilings) * 100);
  }

  severityClass(severity: string): string {
    switch (severity) {
      case 'high':
        return 'border-l-4 border-error';
      case 'medium':
        return 'border-l-4 border-secondary';
      default:
        return 'border-l-4 border-outline-variant';
    }
  }

  statusBadgeClass(status: string): string {
    return status === 'Success' ? 'bg-tertiary-fixed-dim/20 text-on-tertiary-fixed-variant' : 'bg-error-container text-on-error-container';
  }
}
