import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdvisoryServicesService } from './advisory-services.service';
import { ADVISORY_CUSTOMERS, IpoListing } from './advisory-services-data.mock';

@Component({
  selector: 'app-ipo',
  standalone: true,
  imports: [CommonModule],
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
}
