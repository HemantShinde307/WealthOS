import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TransactionService } from '../../../core/services/transaction.service';
import { Transaction } from '../../../core/models/domain.models';

type TypeFilter = 'All' | Transaction['type'];
type StatusFilter = 'All' | Transaction['status'];

@Component({
  selector: 'app-advisor-transactions',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './transactions.component.html',
})
export class TransactionsComponent {
  readonly transactionService = inject(TransactionService);

  readonly search = signal('');
  readonly typeFilter = signal<TypeFilter>('All');
  readonly statusFilter = signal<StatusFilter>('All');

  readonly types: TypeFilter[] = ['All', 'Purchase', 'SIP', 'Redemption', 'Switch', 'Gold Purchase', 'Gold Sell', 'Gold SIP'];
  readonly statuses: StatusFilter[] = ['All', 'Completed', 'Processing', 'Pending', 'Failed', 'Cancelled'];

  readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const type = this.typeFilter();
    const status = this.statusFilter();
    return this.transactionService
      .transactions()
      .filter((t) => (type === 'All' ? true : t.type === type))
      .filter((t) => (status === 'All' ? true : t.status === status))
      .filter((t) => (term ? t.clientName.toLowerCase().includes(term) || t.schemeName.toLowerCase().includes(term) : true));
  });

  readonly summary = computed(() => {
    const list = this.transactionService.transactions();
    return {
      totalValue: list.reduce((sum, t) => sum + t.amount, 0),
      completed: list.filter((t) => t.status === 'Completed').length,
      pending: list.filter((t) => t.status === 'Pending' || t.status === 'Processing').length,
      failed: list.filter((t) => t.status === 'Failed' || t.status === 'Cancelled').length,
    };
  });

  statusClasses(status: Transaction['status']): string {
    switch (status) {
      case 'Completed':
        return 'bg-tertiary-container text-on-tertiary-container';
      case 'Pending':
      case 'Processing':
        return 'bg-surface-container text-payout-gold';
      default:
        return 'bg-error-container text-error';
    }
  }

  typeIcon(type: Transaction['type']): string {
    switch (type) {
      case 'Purchase':
        return 'trending_up';
      case 'SIP':
        return 'sync';
      case 'Redemption':
        return 'sell';
      case 'Switch':
        return 'swap_horiz';
      default:
        return 'monetization_on';
    }
  }
}
