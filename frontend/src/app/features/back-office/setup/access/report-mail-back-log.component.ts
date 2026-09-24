import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportMailBackLogEntry } from '../setup-data.mock';
import { SetupService } from '../setup.service';
import { ExportButtonComponent } from '../../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../../shared/utils/confirm';

type StatusFilter = 'All' | ReportMailBackLogEntry['status'];

@Component({
  selector: 'app-report-mail-back-log',
  standalone: true,
  imports: [CommonModule, ExportButtonComponent],
  templateUrl: './report-mail-back-log.component.html',
})
export class ReportMailBackLogComponent {
  readonly setup = inject(SetupService);

  readonly exportHeaders = ['Customer', 'Report', 'Email', 'Sent On', 'Status', 'Reason'];
  readonly exportRows = computed(() =>
    this.filtered().map((e) => [e.customerName, e.reportName, e.emailId, e.sentOn, e.status, e.reason]),
  );

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

  remove(e: ReportMailBackLogEntry): void {
    if (!confirmDelete(`the mail-back log entry for ${e.customerName}`)) return;
    this.setup.deleteReportMailBackLogEntry(e.id);
  }
}
