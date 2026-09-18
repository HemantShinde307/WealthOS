import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CommissionService } from '../../../core/services/commission.service';

@Component({
  selector: 'app-commission-reports',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './commission-reports.component.html',
})
export class CommissionReportsComponent {
  readonly commissionService = inject(CommissionService);
  readonly search = signal('');

  readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    return this.commissionService
      .entries()
      .filter((e) => (term ? e.clientName.toLowerCase().includes(term) || e.schemeName.toLowerCase().includes(term) : true));
  });

  readonly totals = computed(() => {
    const list = this.filtered();
    return {
      transactionAmount: list.reduce((s, e) => s + e.transactionAmount, 0),
      commissionAmount: list.reduce((s, e) => s + e.commissionAmount, 0),
    };
  });
}
