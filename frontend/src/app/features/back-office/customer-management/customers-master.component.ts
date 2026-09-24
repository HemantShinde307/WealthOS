import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';
import { BackOfficeCustomerService } from '../back-office-customer.service';
import { ExportButtonComponent } from '../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../shared/utils/confirm';
import { BackOfficeCustomer } from '../back-office-data.mock';
import { CustomerEditFormComponent } from './customer-edit-form.component';

@Component({
  selector: 'app-customers-master',
  standalone: true,
  imports: [CommonModule, RouterLink, InrCompactPipe, ExportButtonComponent, CustomerEditFormComponent],
  templateUrl: './customers-master.component.html',
})
export class CustomersMasterComponent {
  readonly boService = inject(BackOfficeCustomerService);

  readonly exportHeaders = ['ID', 'Name', 'PAN', 'Email', 'Phone', 'Segment', 'Risk Profile', 'KYC Status', 'Group', 'Status', 'AUM'];
  readonly exportRows = computed(() =>
    this.filtered().map((c) => [c.id, c.name, c.pan, c.email, c.phone, c.segment, c.riskProfile, c.kycStatus, this.groupName(c.groupId), c.status, c.aum]),
  );

  readonly search = signal('');

  readonly filtered = computed(() => {
    const term = this.search().toLowerCase().trim();
    if (!term) return this.boService.customers();
    return this.boService.customers().filter(
      (c) => c.name.toLowerCase().includes(term) || c.pan.toLowerCase().includes(term) || c.email.toLowerCase().includes(term) || c.id.toLowerCase().includes(term),
    );
  });

  groupName(groupId: string | null): string {
    if (!groupId) return '—';
    return this.boService.getGroup(groupId)?.name ?? groupId;
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
    if (this.editingCustomer()?.id === c.id) this.editingCustomer.set(null);
  }
}
