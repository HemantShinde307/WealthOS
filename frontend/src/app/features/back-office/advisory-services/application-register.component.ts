import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdvisoryServicesService } from './advisory-services.service';
import { ApplicationStatus } from './advisory-services-data.mock';

@Component({
  selector: 'app-application-register',
  standalone: true,
  imports: [CommonModule],
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
}
