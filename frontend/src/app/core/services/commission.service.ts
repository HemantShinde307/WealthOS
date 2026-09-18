import { Injectable, signal, computed } from '@angular/core';
import { CommissionEntry } from '../models/domain.models';
import { MOCK_COMMISSIONS } from '../mock-data';

@Injectable({ providedIn: 'root' })
export class CommissionService {
  private readonly _entries = signal<CommissionEntry[]>(MOCK_COMMISSIONS);
  readonly entries = this._entries.asReadonly();

  readonly totalPaid = computed(() => this._entries().filter((e) => e.status === 'Paid').reduce((s, e) => s + e.commissionAmount, 0));
  readonly totalPending = computed(() => this._entries().filter((e) => e.status !== 'Paid').reduce((s, e) => s + e.commissionAmount, 0));
}
