import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';
import { BackOfficeCustomerService } from '../back-office-customer.service';

@Component({
  selector: 'app-active-inactive-customers',
  standalone: true,
  imports: [CommonModule, InrCompactPipe],
  templateUrl: './active-inactive-customers.component.html',
})
export class ActiveInactiveCustomersComponent {
  readonly boService = inject(BackOfficeCustomerService);

  readonly statusTab = signal<'Active' | 'Inactive'>('Active');
  readonly selectedIds = signal<Set<string>>(new Set());

  readonly filtered = computed(() => this.boService.customers().filter((c) => c.status === this.statusTab()));

  setTab(tab: 'Active' | 'Inactive'): void {
    this.statusTab.set(tab);
    this.selectedIds.set(new Set());
  }

  toggle(id: string): void {
    this.selectedIds.update((set) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  toggleAll(): void {
    const allIds = this.filtered().map((c) => c.id);
    const allSelected = allIds.every((id) => this.selectedIds().has(id));
    this.selectedIds.set(allSelected ? new Set() : new Set(allIds));
  }

  applyBulkStatus(status: 'Active' | 'Inactive'): void {
    if (!this.selectedIds().size) return;
    this.boService.setStatus([...this.selectedIds()], status);
    this.selectedIds.set(new Set());
  }

  setOne(id: string, status: 'Active' | 'Inactive'): void {
    this.boService.setStatus([id], status);
  }
}
