import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdvisoryServicesService } from './advisory-services.service';
import { ServiceRequestPriority, ServiceRequestStatus } from './advisory-services-data.mock';

@Component({
  selector: 'app-view-service-request',
  standalone: true,
  imports: [CommonModule],
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
}
