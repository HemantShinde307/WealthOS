import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MutualFundService } from './mutual-fund.service';
import { MfFolio } from './mutual-fund-data.mock';
import { ExportButtonComponent } from '../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../shared/utils/confirm';

@Component({
  selector: 'app-mf-folio-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ExportButtonComponent],
  templateUrl: './folio-list.component.html',
})
export class FolioListComponent {
  readonly mfService = inject(MutualFundService);

  readonly search = signal('');
  readonly amcFilter = signal('All');
  readonly statusFilter = signal('All');

  readonly amcs = computed(() => Array.from(new Set(this.mfService.folios().map((f) => f.amc))).sort());

  readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const amc = this.amcFilter();
    const status = this.statusFilter();
    return this.mfService.folios().filter((f) => {
      if (amc !== 'All' && f.amc !== amc) return false;
      if (status !== 'All' && f.status !== status) return false;
      if (!q) return true;
      return (
        f.folioNumber.toLowerCase().includes(q) ||
        f.scheme.toLowerCase().includes(q) ||
        f.customerName.toLowerCase().includes(q) ||
        f.pan.toLowerCase().includes(q)
      );
    });
  });

  readonly exportHeaders = ['Folio No.', 'AMC', 'Scheme', 'Customer', 'PAN', 'Units', 'Current NAV', 'Value', 'Status'];
  readonly exportRows = computed(() =>
    this.filtered().map((f) => [f.folioNumber, f.amc, f.scheme, f.customerName, f.pan, f.units, f.currentNav, Math.round(f.units * f.currentNav), f.status]),
  );

  readonly editingId = signal<string | null>(null);
  readonly editFolioNumber = signal('');
  readonly editCustomerName = signal('');
  readonly editPan = signal('');
  readonly editStatus = signal<MfFolio['status']>('Active');
  readonly error = signal<string | null>(null);

  edit(f: MfFolio): void {
    this.editingId.set(f.id);
    this.editFolioNumber.set(f.folioNumber);
    this.editCustomerName.set(f.customerName);
    this.editPan.set(f.pan);
    this.editStatus.set(f.status);
    this.error.set(null);
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  saveEdit(): void {
    const id = this.editingId();
    if (!id) return;
    if (!this.editFolioNumber().trim() || !this.editCustomerName().trim()) {
      this.error.set('Folio number and customer name are required.');
      return;
    }
    this.mfService.updateFolio(id, {
      folioNumber: this.editFolioNumber().trim(),
      customerName: this.editCustomerName().trim(),
      pan: this.editPan().trim().toUpperCase(),
      status: this.editStatus(),
    });
    this.editingId.set(null);
  }

  remove(f: MfFolio): void {
    if (!confirmDelete(`folio ${f.folioNumber} (${f.customerName}) along with its transactions and mandates`)) return;
    this.mfService.deleteFolio(f.id);
    if (this.editingId() === f.id) this.editingId.set(null);
  }

  readonly currentValue = (units: number, nav: number) => units * nav;
}
