import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';
import { BackOfficeCustomerService } from '../back-office-customer.service';
import { ExportButtonComponent } from '../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../shared/utils/confirm';
import { BackOfficeCustomer } from '../back-office-data.mock';
import { CustomerEditFormComponent } from './customer-edit-form.component';

@Component({
  selector: 'app-active-inactive-customers',
  standalone: true,
  imports: [CommonModule, InrCompactPipe, ExportButtonComponent, CustomerEditFormComponent],
  templateUrl: './active-inactive-customers.component.html',
})
export class ActiveInactiveCustomersComponent {
  readonly boService = inject(BackOfficeCustomerService);

  readonly exportHeaders = ['ID', 'Name', 'PAN', 'Email', 'Phone', 'Segment', 'Risk Profile', 'KYC Status', 'Group', 'Status', 'AUM'];
  readonly exportRows = computed(() =>
    this.filtered().map((c) => [c.id, c.name, c.pan, c.email, c.phone, c.segment, c.riskProfile, c.kycStatus, this.boService.getGroup(c.groupId ?? '')?.name ?? '—', c.status, c.aum]),
  );

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

  readonly editingCustomer = signal<BackOfficeCustomer | null>(null);

  edit(c: BackOfficeCustomer): void {
    this.editingCustomer.set(c);
  }

  saveEdit(patch: Partial<BackOfficeCustomer>): void {
    const c = this.editingCustomer();
    if (c) this.boService.updateCustomer(c.id, patch);
    this.editingCustomer.set(null);
  }

  remove(c: BackOfficeCustomer): void {
    if (!confirmDelete(`customer ${c.name} (${c.id})`)) return;
    this.boService.deleteCustomer(c.id);
    this.selectedIds.update((set) => { const next = new Set(set); next.delete(c.id); return next; });
    if (this.editingCustomer()?.id === c.id) this.editingCustomer.set(null);
  }
}
