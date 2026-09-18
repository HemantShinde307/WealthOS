import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdvisoryServicesService } from './advisory-services.service';
import { ADVISORY_CUSTOMERS } from './advisory-services-data.mock';

const LENDERS = ['HDFC Bank', 'ICICI Bank', 'Kotak Mahindra Bank', 'Axis Finance', 'Bajaj Finserv'];

@Component({
  selector: 'app-loan-against-securities',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loan-against-securities.component.html',
})
export class LoanAgainstSecuritiesComponent {
  readonly svc = inject(AdvisoryServicesService);
  readonly customers = ADVISORY_CUSTOMERS;
  readonly lenders = LENDERS;

  readonly search = signal('');
  readonly showForm = signal(false);

  readonly customerName = signal(ADVISORY_CUSTOMERS[0].name);
  readonly lender = signal(LENDERS[0]);
  readonly pledgedValue = signal<number>(1000000);
  readonly requestedLimit = signal<number>(500000);
  readonly submitted = signal(false);

  readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    return this.svc.lasFacilities().filter((l) => !q || l.customerName.toLowerCase().includes(q) || l.lender.toLowerCase().includes(q));
  });

  readonly totalSanctioned = computed(() => this.svc.lasFacilities().reduce((sum, l) => sum + l.sanctionedLimit, 0));
  readonly totalUtilized = computed(() => this.svc.lasFacilities().reduce((sum, l) => sum + l.utilizedAmount, 0));

  utilizationPct(sanctioned: number, utilized: number): number {
    return sanctioned > 0 ? (utilized / sanctioned) * 100 : 0;
  }

  submit(): void {
    if (!this.pledgedValue() || !this.requestedLimit()) return;
    this.svc.submitLasApplication({
      customerName: this.customerName(),
      lender: this.lender(),
      pledgedSecuritiesValue: this.pledgedValue(),
      requestedLimit: this.requestedLimit(),
    });
    this.submitted.set(true);
    this.showForm.set(false);
  }
}
