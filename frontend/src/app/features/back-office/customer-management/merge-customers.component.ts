import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BackOfficeCustomer } from '../back-office-data.mock';
import { BackOfficeCustomerService } from '../back-office-customer.service';

const MERGE_FIELDS: (keyof BackOfficeCustomer)[] = ['name', 'email', 'phone', 'pan', 'riskProfile', 'segment', 'kycStatus'];

@Component({
  selector: 'app-merge-customers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './merge-customers.component.html',
})
export class MergeCustomersComponent {
  readonly boService = inject(BackOfficeCustomerService);
  private readonly router = inject(Router);

  readonly fields = MERGE_FIELDS;
  readonly customerAId = signal('');
  readonly customerBId = signal('');
  readonly winners = signal<Record<string, 'A' | 'B'>>({});
  readonly survivorSide = signal<'A' | 'B'>('A');
  readonly done = signal(false);

  readonly customerA = computed(() => this.boService.getCustomer(this.customerAId()));
  readonly customerB = computed(() => this.boService.getCustomer(this.customerBId()));
  readonly canMerge = computed(() => !!this.customerAId() && !!this.customerBId() && this.customerAId() !== this.customerBId());

  pickWinner(field: string, side: 'A' | 'B'): void {
    this.winners.update((w) => ({ ...w, [field]: side }));
  }

  winnerFor(field: string): 'A' | 'B' {
    return this.winners()[field] ?? 'A';
  }

  merge(): void {
    const a = this.customerA();
    const b = this.customerB();
    if (!a || !b) return;
    const overrides: Partial<BackOfficeCustomer> = {};
    for (const field of this.fields) {
      const winner = this.winnerFor(field) === 'A' ? a : b;
      (overrides as any)[field] = winner[field];
    }
    const survivorId = this.survivorSide() === 'A' ? a.id : b.id;
    const loserId = this.survivorSide() === 'A' ? b.id : a.id;
    this.boService.mergeCustomers(survivorId, loserId, overrides);
    this.done.set(true);
    setTimeout(() => this.router.navigate(['/back-office/customer-management/master', survivorId]), 1200);
  }
}
