import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportButtonComponent } from '../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../shared/utils/confirm';
import { AdvisoryServicesService } from './advisory-services.service';
import { ApplicationStatus, ApplicationRegisterEntry, ApplicationType } from './advisory-services-data.mock';

@Component({
  selector: 'app-application-register',
  standalone: true,
  imports: [CommonModule, ExportButtonComponent],
  templateUrl: './application-register.component.html',
})
export class ApplicationRegisterComponent {
  readonly svc = inject(AdvisoryServicesService);

  readonly statusFilter = signal<'All' | ApplicationStatus>('All');
  readonly search = signal('');

  readonly statusOptions: ApplicationStatus[] = ['Pending', 'Processing', 'Completed', 'Rejected'];

  readonly filtered = computed(() => {
    const status = this.statusFilter();
    const q = this.search().trim().toLowerCase();
    return this.svc
      .applications()
      .filter((a) => (status === 'All' || a.status === status) && (!q || a.customerName.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || a.applicationType.toLowerCase().includes(q)))
      .sort((a, b) => b.submittedOn.localeCompare(a.submittedOn));
  });

  counts(status: ApplicationStatus): number {
    return this.svc.applications().filter((a) => a.status === status).length;
  }

  setStatus(id: string, status: ApplicationStatus): void {
    this.svc.setApplicationStatus(id, status);
  }

  readonly exportHeaders = ['Application No.', 'Customer', 'Type', 'Branch', 'Submitted On', 'Status', 'Remarks'];
  readonly exportRows = computed(() => this.filtered().map((x) => [x.id, x.customerName, x.applicationType, x.branch, x.submittedOn, x.status, x.remarks]));

  readonly editingId = signal<string | null>(null);
  readonly eCustomerName = signal<string>('');
  readonly eApplicationType = signal<ApplicationType>('New Account Opening');
  readonly eBranch = signal<string>('');
  readonly eStatus = signal<ApplicationStatus>('Pending');
  readonly eRemarks = signal<string>('');
  readonly editError = signal<string | null>(null);
  readonly typeOptions: ApplicationType[] = [
    'New Account Opening',
    'Mandate Registration (NACH)',
    'Nomination Update',
    'Bank Mandate Change',
    'Folio Consolidation',
    'Address Change',
    'Email/Mobile Update',
    'Demat to MF Conversion',
  ];

  edit(x: ApplicationRegisterEntry): void {
    this.editingId.set(x.id);
    this.eCustomerName.set(x.customerName);
    this.eApplicationType.set(x.applicationType);
    this.eBranch.set(x.branch);
    this.eStatus.set(x.status);
    this.eRemarks.set(x.remarks);
    this.editError.set(null);
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  saveEdit(): void {
    const id = this.editingId();
    if (!id) return;
    if (!this.eCustomerName().trim() || !this.eBranch().trim()) {
      this.editError.set('Please fill in all required fields.');
      return;
    }
    this.svc.updateApplication(id, { customerName: this.eCustomerName().trim(), applicationType: this.eApplicationType(), branch: this.eBranch().trim(), status: this.eStatus(), remarks: this.eRemarks().trim() });
    this.editingId.set(null);
  }

  remove(x: ApplicationRegisterEntry): void {
    if (!confirmDelete(`application ${x.id} for ${x.customerName}`)) return;
    this.svc.deleteApplication(x.id);
    if (this.editingId() === x.id) this.editingId.set(null);
  }
}
