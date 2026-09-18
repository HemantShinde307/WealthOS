import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClientService } from '../../../core/services/client.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { CommissionService } from '../../../core/services/commission.service';
import { AuthService } from '../../../core/services/auth.service';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';

@Component({
  selector: 'app-advisor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatCardComponent, InrCompactPipe],
  templateUrl: './dashboard.component.html',
})
export class AdvisorDashboardComponent {
  readonly clientService = inject(ClientService);
  readonly transactionService = inject(TransactionService);
  readonly commissionService = inject(CommissionService);
  readonly auth = inject(AuthService);

  readonly clientCount = computed(() => this.clientService.clients().length);
  readonly pendingTransactions = computed(() =>
    this.transactionService.transactions().filter((t) => t.status === 'Pending' || t.status === 'Processing'),
  );
  readonly topClients = computed(() =>
    [...this.clientService.clients()]
      .sort((a, b) => b.aum - a.aum)
      .slice(0, 5),
  );
  readonly kycAlerts = computed(() =>
    this.clientService.clients().filter((c) => c.kycStatus === 'Pending' || c.kycStatus === 'Rejected').length,
  );

  readonly recentTransactions = computed(() => this.transactionService.recent(5));

  // Illustrative churn-risk heuristic derived from real signals already in the mock data
  // (failed/cancelled transactions, rejected KYC). A production model would also weigh
  // login recency and SIP-pause events, which aren't tracked in this prototype's data model.
  readonly churnRisks = computed(() => {
    const clients = this.clientService.clients();
    const transactions = this.transactionService.transactions();
    return clients
      .map((c) => {
        const badTxn = transactions.find((t) => t.clientId === c.id && (t.status === 'Failed' || t.status === 'Cancelled'));
        if (badTxn) {
          return { client: c, reason: `${badTxn.type} transaction ${badTxn.status.toLowerCase()} on ${badTxn.date}` };
        }
        if (c.kycStatus === 'Rejected') {
          return { client: c, reason: 'KYC was rejected — account currently unusable' };
        }
        return null;
      })
      .filter((r): r is { client: (typeof clients)[number]; reason: string } => r !== null)
      .slice(0, 3);
  });
}
