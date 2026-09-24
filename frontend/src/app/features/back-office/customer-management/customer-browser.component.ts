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
  selector: 'app-customer-browser',
  standalone: true,
  imports: [CommonModule, RouterLink, InrCompactPipe, ExportButtonComponent, CustomerEditFormComponent],
  templateUrl: './customer-browser.component.html',
})
export class CustomerBrowserComponent {
  readonly boService = inject(BackOfficeCustomerService);

  readonly exportHeaders = ['ID', 'Name', 'PAN', 'Email', 'Phone', 'Segment', 'Risk Profile', 'KYC Status', 'Status', 'AUM'];
  readonly exportRows = computed(() =>
    this.results().map((c) => [c.id, c.name, c.pan, c.email, c.phone, c.segment, c.riskProfile, c.kycStatus, c.status, c.aum]),
  );

  readonly segmentFilter = signal('All');
  readonly riskFilter = signal('All');
  readonly kycFilter = signal('All');
  readonly statusFilter = signal('All');
  readonly minAum = signal<number | null>(null);

  readonly results = computed(() => {
    const segment = this.segmentFilter();
    const risk = this.riskFilter();
    const kyc = this.kycFilter();
    const status = this.statusFilter();
    const min = this.minAum();
    return this.boService.customers().filter((c) => {
      if (segment !== 'All' && c.segment !== segment) return false;
      if (risk !== 'All' && c.riskProfile !== risk) return false;
      if (kyc !== 'All' && c.kycStatus !== kyc) return false;
      if (status !== 'All' && c.status !== status) return false;
      if (min !== null && c.aum < min) return false;
      return true;
    });
  });

  setMinAum(value: string): void {
    const n = Number(value);
    this.minAum.set(value === '' || Number.isNaN(n) ? null : n);
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
