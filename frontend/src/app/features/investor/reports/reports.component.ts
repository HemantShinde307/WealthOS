import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../../core/services/transaction.service';
import { AuthService } from '../../../core/services/auth.service';

interface ReportDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-investor-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
})
export class ReportsComponent {
  private readonly transactionService = inject(TransactionService);
  private readonly auth = inject(AuthService);

  readonly periods = ['Last 3 Months', 'Last 6 Months', 'Last 1 Year', 'Financial Year 2025-26', 'Since Inception'];
  selectedPeriod = this.periods[2];

  readonly reports: ReportDefinition[] = [
    { id: 'account-statement', title: 'Account Statement', description: 'Consolidated summary of all your holdings and their current value.', icon: 'description' },
    { id: 'capital-gains', title: 'Capital Gains Statement', description: 'Realized short-term and long-term capital gains for tax filing.', icon: 'receipt_long' },
    { id: 'transaction-history', title: 'Transaction History', description: 'Detailed log of every purchase, SIP, and redemption.', icon: 'history' },
    { id: 'portfolio-valuation', title: 'Portfolio Valuation Report', description: 'Scheme-wise valuation as of the selected period end date.', icon: 'monitoring' },
  ];

  readonly generatingId = signal<string | null>(null);
  readonly generatedIds = signal<Set<string>>(new Set());

  generate(reportId: string): void {
    this.generatingId.set(reportId);
    setTimeout(() => {
      this.generatingId.set(null);
      this.generatedIds.update((set) => new Set(set).add(reportId));
    }, 900);
  }

  recentTransactions() {
    const customerId = this.auth.currentUser().customerId;
    return this.transactionService
      .transactions()
      .filter((t) => t.clientId === customerId)
      .slice(0, 6);
  }
}
