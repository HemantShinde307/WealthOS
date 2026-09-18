import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdvisoryServicesService } from './advisory-services.service';
import { ADVISORY_CUSTOMERS, EcasStatus } from './advisory-services-data.mock';

@Component({
  selector: 'app-ecas',
  standalone: true,
  imports: [CommonModule],
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
}
