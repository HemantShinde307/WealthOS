import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportButtonComponent } from '../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../shared/utils/confirm';
import { AdvisoryServicesService } from './advisory-services.service';
import { ADVISORY_CUSTOMERS, LasFacility, LasStatus } from './advisory-services-data.mock';

const LENDERS = ['HDFC Bank', 'ICICI Bank', 'Kotak Mahindra Bank', 'Axis Finance', 'Bajaj Finserv'];

@Component({
  selector: 'app-loan-against-securities',
  standalone: true,
  imports: [CommonModule, ExportButtonComponent],
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

  readonly exportHeaders = ['Customer', 'Lender', 'Pledged Securities Value', 'Sanctioned Limit', 'Utilized Amount', 'Interest Rate (%)', 'Sanction Date', 'Status'];
  readonly exportRows = computed(() => this.filtered().map((x) => [x.customerName, x.lender, x.pledgedSecuritiesValue, x.sanctionedLimit, x.utilizedAmount, x.interestRatePct, x.sanctionDate, x.status]));

  readonly editingId = signal<string | null>(null);
  readonly eCustomerName = signal<string>('');
  readonly eLender = signal<string>('');
  readonly ePledgedSecuritiesValue = signal<number>(0);
  readonly eSanctionedLimit = signal<number>(0);
  readonly eUtilizedAmount = signal<number>(0);
  readonly eInterestRatePct = signal<number>(0);
  readonly eStatus = signal<LasStatus>('Under Review');
  readonly editError = signal<string | null>(null);
  readonly statusOptions: LasStatus[] = ['Active', 'Under Review', 'Closed'];

  edit(x: LasFacility): void {
    this.editingId.set(x.id);
    this.eCustomerName.set(x.customerName);
    this.eLender.set(x.lender);
    this.ePledgedSecuritiesValue.set(x.pledgedSecuritiesValue);
    this.eSanctionedLimit.set(x.sanctionedLimit);
    this.eUtilizedAmount.set(x.utilizedAmount);
    this.eInterestRatePct.set(x.interestRatePct);
    this.eStatus.set(x.status);
    this.editError.set(null);
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  saveEdit(): void {
    const id = this.editingId();
    if (!id) return;
    if (!this.eCustomerName().trim() || !this.eLender().trim()) {
      this.editError.set('Please fill in all required fields.');
      return;
    }
    this.svc.updateLasFacility(id, { customerName: this.eCustomerName().trim(), lender: this.eLender().trim(), pledgedSecuritiesValue: this.ePledgedSecuritiesValue(), sanctionedLimit: this.eSanctionedLimit(), utilizedAmount: this.eUtilizedAmount(), interestRatePct: this.eInterestRatePct(), status: this.eStatus() });
    this.editingId.set(null);
  }

  remove(x: LasFacility): void {
    if (!confirmDelete(`the loan facility ${x.id} for ${x.customerName}`)) return;
    this.svc.deleteLasFacility(x.id);
    if (this.editingId() === x.id) this.editingId.set(null);
  }
}
