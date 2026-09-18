import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';
import { BackOfficeCustomerService } from '../back-office-customer.service';

@Component({
  selector: 'app-customer-browser',
  standalone: true,
  imports: [CommonModule, RouterLink, InrCompactPipe],
  templateUrl: './customer-browser.component.html',
})
export class CustomerBrowserComponent {
  readonly boService = inject(BackOfficeCustomerService);

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

  exportCsv(): void {
    const rows = this.results();
    const header = ['ID', 'Name', 'PAN', 'Email', 'Phone', 'Segment', 'Risk Profile', 'KYC Status', 'Status', 'AUM'];
    const lines = rows.map((c) => [c.id, c.name, c.pan, c.email, c.phone, c.segment, c.riskProfile, c.kycStatus, c.status, c.aum].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','));
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customer-browser-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
