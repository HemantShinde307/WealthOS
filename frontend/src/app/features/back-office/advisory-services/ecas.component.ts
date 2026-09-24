import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportButtonComponent } from '../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../shared/utils/confirm';
import { AdvisoryServicesService } from './advisory-services.service';
import { ADVISORY_CUSTOMERS, EcasStatus, EcasRequest } from './advisory-services-data.mock';

@Component({
  selector: 'app-ecas',
  standalone: true,
  imports: [CommonModule, ExportButtonComponent],
  templateUrl: './ecas.component.html',
})
export class EcasComponent {
  readonly svc = inject(AdvisoryServicesService);
  readonly customers = ADVISORY_CUSTOMERS;

  readonly statusFilter = signal<'All' | EcasStatus>('All');
  readonly search = signal('');
  readonly showForm = signal(false);

  readonly formCustomerName = signal(ADVISORY_CUSTOMERS[0].name);
  readonly formPan = signal(ADVISORY_CUSTOMERS[0].pan);
  readonly formEmail = signal('');
  readonly fromDate = signal('2025-04-01');
  readonly toDate = signal('2026-03-31');
  readonly submitted = signal(false);

  readonly filtered = computed(() => {
    const status = this.statusFilter();
    const q = this.search().trim().toLowerCase();
    return this.svc
      .ecasRequests()
      .filter((e) => (status === 'All' || e.status === status) && (!q || e.customerName.toLowerCase().includes(q) || e.pan.toLowerCase().includes(q) || e.id.toLowerCase().includes(q)));
  });

  onCustomerChange(name: string): void {
    this.formCustomerName.set(name);
    const match = this.customers.find((c) => c.name === name);
    if (match) this.formPan.set(match.pan);
  }

  submit(): void {
    if (!this.formEmail().trim()) return;
    this.svc.createEcasRequest({
      customerName: this.formCustomerName(),
      pan: this.formPan(),
      emailId: this.formEmail().trim(),
      fromDate: this.fromDate(),
      toDate: this.toDate(),
    });
    this.submitted.set(true);
    this.showForm.set(false);
    this.formEmail.set('');
  }

  readonly exportHeaders = ['Request No.', 'Customer', 'PAN', 'Email', 'From Date', 'To Date', 'Requested On', 'Requested By', 'Status'];
  readonly exportRows = computed(() => this.filtered().map((x) => [x.id, x.customerName, x.pan, x.emailId, x.fromDate, x.toDate, x.requestedOn, x.requestedBy, x.status]));

  readonly editingId = signal<string | null>(null);
  readonly eCustomerName = signal<string>('');
  readonly ePan = signal<string>('');
  readonly eEmailId = signal<string>('');
  readonly eFromDate = signal<string>('');
  readonly eToDate = signal<string>('');
  readonly eStatus = signal<EcasStatus>('Queued');
  readonly editError = signal<string | null>(null);
  readonly statusOptions: EcasStatus[] = ['Queued', 'Processing', 'Sent', 'Failed'];

  edit(x: EcasRequest): void {
    this.editingId.set(x.id);
    this.eCustomerName.set(x.customerName);
    this.ePan.set(x.pan);
    this.eEmailId.set(x.emailId);
    this.eFromDate.set(x.fromDate);
    this.eToDate.set(x.toDate);
    this.eStatus.set(x.status);
    this.editError.set(null);
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  saveEdit(): void {
    const id = this.editingId();
    if (!id) return;
    if (!this.eCustomerName().trim() || !this.ePan().trim() || !this.eEmailId().trim()) {
      this.editError.set('Please fill in all required fields.');
      return;
    }
    this.svc.updateEcasRequest(id, { customerName: this.eCustomerName().trim(), pan: this.ePan().trim(), emailId: this.eEmailId().trim(), fromDate: this.eFromDate(), toDate: this.eToDate(), status: this.eStatus() });
    this.editingId.set(null);
  }

  remove(x: EcasRequest): void {
    if (!confirmDelete(`eCAS request ${x.id} for ${x.customerName}`)) return;
    this.svc.deleteEcasRequest(x.id);
    if (this.editingId() === x.id) this.editingId.set(null);
  }
}
