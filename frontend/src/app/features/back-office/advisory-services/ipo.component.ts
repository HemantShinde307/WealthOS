import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportButtonComponent } from '../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../shared/utils/confirm';
import { AdvisoryServicesService } from './advisory-services.service';
import { ADVISORY_CUSTOMERS, IpoListing, IpoApplication } from './advisory-services-data.mock';

@Component({
  selector: 'app-ipo',
  standalone: true,
  imports: [CommonModule, ExportButtonComponent],
  templateUrl: './ipo.component.html',
})
export class IpoComponent {
  readonly svc = inject(AdvisoryServicesService);
  readonly customers = ADVISORY_CUSTOMERS;

  readonly applyingListing = signal<IpoListing | null>(null);
  readonly applyCustomer = signal(ADVISORY_CUSTOMERS[0].name);
  readonly applyLots = signal<number>(1);
  readonly lastApplicationMessage = signal<string | null>(null);

  openApply(listing: IpoListing): void {
    this.applyingListing.set(listing);
    this.applyLots.set(1);
    this.applyCustomer.set(this.customers[0].name);
    this.lastApplicationMessage.set(null);
  }

  closeApply(): void {
    this.applyingListing.set(null);
  }

  estimatedAmount(listing: IpoListing): number {
    return this.applyLots() * listing.lotSize * listing.priceBandHigh;
  }

  confirmApply(): void {
    const listing = this.applyingListing();
    if (!listing || this.applyLots() < 1) return;
    const app = this.svc.applyForIpo(listing, this.applyCustomer(), this.applyLots());
    this.lastApplicationMessage.set(`${this.applyCustomer()} applied for ${app.lots} lot(s) of ${listing.companyName} (₹${app.amount.toLocaleString('en-IN')}) — status: Applied.`);
    this.applyingListing.set(null);
  }

  readonly exportHeaders = ['Application', 'Company', 'Customer', 'Lots', 'Amount', 'Applied On', 'Status'];
  readonly exportRows = computed(() => this.svc.ipoApplications().map((x) => [x.id, x.companyName, x.customerName, x.lots, x.amount, x.appliedOn, x.status]));

  readonly editingId = signal<string | null>(null);
  readonly eCustomerName = signal<string>('');
  readonly eLots = signal<number>(1);
  readonly eStatus = signal<IpoApplication['status']>('Applied');
  readonly editError = signal<string | null>(null);
  readonly statusOptions: IpoApplication['status'][] = ['Applied', 'Allotted', 'Refunded', 'Rejected'];

  edit(x: IpoApplication): void {
    this.editingId.set(x.id);
    this.eCustomerName.set(x.customerName);
    this.eLots.set(x.lots);
    this.eStatus.set(x.status);
    this.editError.set(null);
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  saveEdit(): void {
    const id = this.editingId();
    if (!id) return;
    if (!this.eCustomerName().trim()) {
      this.editError.set('Please fill in all required fields.');
      return;
    }
    this.svc.updateIpoApplication(id, { customerName: this.eCustomerName().trim(), lots: this.eLots(), status: this.eStatus() });
    this.editingId.set(null);
  }

  remove(x: IpoApplication): void {
    if (!confirmDelete(`IPO application ${x.id} for ${x.customerName}`)) return;
    this.svc.deleteIpoApplication(x.id);
    if (this.editingId() === x.id) this.editingId.set(null);
  }
}
