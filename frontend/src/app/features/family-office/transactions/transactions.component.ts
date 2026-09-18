import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FamilyOfficeService } from '../family-office.service';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';

@Component({
  selector: 'app-family-transactions',
  standalone: true,
  imports: [CommonModule, InrCompactPipe],
  templateUrl: './transactions.component.html',
})
export class FamilyTransactionsComponent {
  readonly familyOffice = inject(FamilyOfficeService);

  readonly members = this.familyOffice.members;
  readonly selectedMember = signal<string>('all');

  readonly allTransactions = this.familyOffice.taggedTransactions;

  readonly filteredTransactions = computed(() => {
    const member = this.selectedMember();
    return this.allTransactions().filter((t) => (member === 'all' ? true : t.ownerId === member));
  });

  readonly totalDeployment = computed(() =>
    this.allTransactions()
      .filter((t) => ['Purchase', 'SIP', 'Gold Purchase', 'Gold SIP'].includes(t.type) && t.status === 'Completed')
      .reduce((sum, t) => sum + t.amount, 0),
  );

  readonly activeSips = computed(() => this.allTransactions().filter((t) => t.type === 'SIP' || t.type === 'Gold SIP').length);

  readonly pendingActions = computed(
    () => this.allTransactions().filter((t) => t.status === 'Pending' || t.status === 'Processing').length,
  );

  selectMember(id: string): void {
    this.selectedMember.set(id);
  }

  statusClass(status: string): string {
    switch (status) {
      case 'Completed':
        return 'bg-success/10 text-success';
      case 'Processing':
      case 'Pending':
        return 'bg-warning/10 text-warning';
      case 'Failed':
      case 'Cancelled':
        return 'bg-error-container text-on-error-container';
      default:
        return 'bg-surface-container-high text-on-surface-variant';
    }
  }
}
