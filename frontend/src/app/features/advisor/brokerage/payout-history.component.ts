import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';
import { PAYOUT_BATCHES } from '../advisor-mock-data';

@Component({
  selector: 'app-payout-history',
  standalone: true,
  imports: [CommonModule, RouterLink, InrCompactPipe],
  templateUrl: './payout-history.component.html',
})
export class PayoutHistoryComponent {
  readonly batches = PAYOUT_BATCHES;

  readonly totals = computed(() => ({
    totalPaid: this.batches.filter((b) => b.status === 'Settled').reduce((s, b) => s + b.net, 0),
    totalTds: this.batches.reduce((s, b) => s + b.tds, 0),
    pending: this.batches.filter((b) => b.status === 'Reconciling').reduce((s, b) => s + b.net, 0),
  }));
}
