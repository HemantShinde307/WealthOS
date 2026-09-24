import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportButtonComponent } from '../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../shared/utils/confirm';
import { AdvisoryServicesService } from './advisory-services.service';
import { ServiceRequestPriority, ServiceRequestStatus, ServiceRequestEntry } from './advisory-services-data.mock';

@Component({
  selector: 'app-view-service-request',
  standalone: true,
  imports: [CommonModule, ExportButtonComponent],
  templateUrl: './view-service-request.component.html',
})
export class ViewServiceRequestComponent {
  readonly svc = inject(AdvisoryServicesService);

  readonly statusFilter = signal<'All' | ServiceRequestStatus>('All');
  readonly priorityFilter = signal<'All' | ServiceRequestPriority>('All');
  readonly search = signal('');
  readonly selectedId = signal<string | null>(null);

  readonly statusOptions: ServiceRequestStatus[] = ['Open', 'In Progress', 'Resolved', 'Closed'];
  readonly priorityOptions: ServiceRequestPriority[] = ['Low', 'Medium', 'High', 'Urgent'];

  readonly filtered = computed(() => {
    const status = this.statusFilter();
    const priority = this.priorityFilter();
    const q = this.search().trim().toLowerCase();
    return this.svc
      .serviceRequests()
      .filter(
        (s) =>
          (status === 'All' || s.status === status) &&
          (priority === 'All' || s.priority === priority) &&
          (!q || s.customerName.toLowerCase().includes(q) || s.subject.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)),
      )
      .sort((a, b) => b.raisedOn.localeCompare(a.raisedOn));
  });

  readonly selected = computed(() => this.svc.serviceRequests().find((s) => s.id === this.selectedId()) ?? null);

  select(id: string): void {
    this.selectedId.set(id === this.selectedId() ? null : id);
  }

  setStatus(id: string, status: ServiceRequestStatus): void {
    this.svc.setServiceRequestStatus(id, status);
  }

  markResolved(id: string): void {
    this.svc.setServiceRequestStatus(id, 'Resolved');
  }

  readonly exportHeaders = ['Ticket No.', 'Customer', 'Subject', 'Category', 'Priority', 'Status', 'Raised On', 'Assigned To', 'Description'];
  readonly exportRows = computed(() => this.filtered().map((x) => [x.id, x.customerName, x.subject, x.category, x.priority, x.status, x.raisedOn, x.assignedTo, x.description]));

  readonly editingId = signal<string | null>(null);
  readonly eCustomerName = signal<string>('');
  readonly eSubject = signal<string>('');
  readonly eCategory = signal<string>('');
  readonly ePriority = signal<ServiceRequestPriority>('Medium');
  readonly eStatus = signal<ServiceRequestStatus>('Open');
  readonly eAssignedTo = signal<string>('');
  readonly eDescription = signal<string>('');
  readonly editError = signal<string | null>(null);

  edit(x: ServiceRequestEntry): void {
    this.editingId.set(x.id);
    this.eCustomerName.set(x.customerName);
    this.eSubject.set(x.subject);
    this.eCategory.set(x.category);
    this.ePriority.set(x.priority);
    this.eStatus.set(x.status);
    this.eAssignedTo.set(x.assignedTo);
    this.eDescription.set(x.description);
    this.editError.set(null);
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  saveEdit(): void {
    const id = this.editingId();
    if (!id) return;
    if (!this.eCustomerName().trim() || !this.eSubject().trim()) {
      this.editError.set('Please fill in all required fields.');
      return;
    }
    this.svc.updateServiceRequest(id, { customerName: this.eCustomerName().trim(), subject: this.eSubject().trim(), category: this.eCategory().trim(), priority: this.ePriority(), status: this.eStatus(), assignedTo: this.eAssignedTo().trim(), description: this.eDescription().trim() });
    this.editingId.set(null);
  }

  remove(x: ServiceRequestEntry): void {
    if (!confirmDelete(`service request ${x.id} for ${x.customerName}`)) return;
    this.svc.deleteServiceRequest(x.id);
    if (this.editingId() === x.id) this.editingId.set(null);
  }
}
