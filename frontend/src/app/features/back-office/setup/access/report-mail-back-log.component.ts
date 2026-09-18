import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportMailBackLogEntry } from '../setup-data.mock';
import { SetupService } from '../setup.service';

type StatusFilter = 'All' | ReportMailBackLogEntry['status'];

@Component({
  selector: 'app-report-mail-back-log',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-mail-back-log.component.html',
})
export class ReportMailBackLogComponent {
  readonly setup = inject(SetupService);

  readonly searchTerm = signal('');
  readonly statusFilter = signal<StatusFilter>('All');

  readonly filtered = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const status = this.statusFilter();
    return this.setup.reportMailBackLog().filter((e) => {
      const matchesTerm = !term || `${e.customerName} ${e.reportName} ${e.emailId}`.toLowerCase().includes(term);
      const matchesStatus = status === 'All' || e.status === status;
      return matchesTerm && matchesStatus;
    });
  });

  readonly bouncedCount = computed(() => this.setup.reportMailBackLog().filter((e) => e.status === 'Bounced').length);
  readonly failedCount = computed(() => this.setup.reportMailBackLog().filter((e) => e.status === 'Failed').length);
}
