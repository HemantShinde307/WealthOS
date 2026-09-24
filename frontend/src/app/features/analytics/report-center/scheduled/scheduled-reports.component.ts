import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExportButtonComponent } from '../../../../shared/components/export-button/export-button.component';
import { SCHEDULED_REPORTS, ScheduledReport } from '../../analytics-data.mock';

type StatusFilter = 'All' | ScheduledReport['status'];

@Component({
  selector: 'app-scheduled-reports',
  standalone: true,
  imports: [CommonModule, RouterLink, ExportButtonComponent],
  templateUrl: './scheduled-reports.component.html',
})
export class ScheduledReportsComponent {
  readonly reports = signal<ScheduledReport[]>(SCHEDULED_REPORTS);
  readonly searchTerm = signal('');
  readonly statusFilter = signal<StatusFilter>('All');

  readonly filteredReports = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const status = this.statusFilter();
    return this.reports().filter((r) => {
      const matchesTerm = !term || r.clientName.toLowerCase().includes(term) || r.reportType.toLowerCase().includes(term);
      const matchesStatus = status === 'All' || r.status === status;
      return matchesTerm && matchesStatus;
    });
  });

  readonly exportHeaders = ['Client Name', 'Report Type', 'Frequency', 'Next Run Date', 'Delivery Method', 'Status'];
  readonly exportRows = computed(() =>
    this.filteredReports().map((r) => [r.clientName, r.reportType, r.frequency, r.nextRunDate, r.deliveryMethod, r.status]),
  );

  readonly activeCount = computed(() => this.reports().filter((r) => r.status === 'Active').length);
  readonly errorCount = computed(() => this.reports().filter((r) => r.status === 'Error').length);

  readonly deliverySuccessRate = 99.6;
  readonly totalDelivered = 8420;
  readonly bounceCount = 14;

  setSearchTerm(value: string): void {
    this.searchTerm.set(value);
  }

  setStatusFilter(value: StatusFilter): void {
    this.statusFilter.set(value);
  }

  togglePause(id: string): void {
    this.reports.update((list) =>
      list.map((r) => (r.id === id ? { ...r, status: r.status === 'Paused' ? 'Active' : 'Paused' } : r)),
    );
  }

  statusDotClass(status: ScheduledReport['status']): string {
    if (status === 'Active') return 'bg-on-tertiary-container';
    if (status === 'Error') return 'bg-error';
    return 'bg-on-surface-variant';
  }
}
