import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ScheduleServiceLogEntry } from '../setup-data.mock';
import { SetupService } from '../setup.service';
import { ExportButtonComponent } from '../../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../../shared/utils/confirm';

type StatusFilter = 'All' | ScheduleServiceLogEntry['status'];

@Component({
  selector: 'app-schedule-service-log',
  standalone: true,
  imports: [CommonModule, RouterLink, ExportButtonComponent],
  templateUrl: './schedule-service-log.component.html',
})
export class ScheduleServiceLogComponent {
  readonly setup = inject(SetupService);

  readonly exportHeaders = ['Service', 'Run On', 'Duration (s)', 'Records Processed', 'Status'];
  readonly exportRows = computed(() =>
    this.filtered().map((e) => [e.serviceName, e.runOn, e.durationSec, e.recordsProcessed, e.status]),
  );

  readonly searchTerm = signal('');
  readonly statusFilter = signal<StatusFilter>('All');

  readonly filtered = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const status = this.statusFilter();
    return this.setup.scheduleServiceLog().filter((e) => {
      const matchesTerm = !term || e.serviceName.toLowerCase().includes(term);
      const matchesStatus = status === 'All' || e.status === status;
      return matchesTerm && matchesStatus;
    });
  });

  readonly failedCount = computed(() => this.setup.scheduleServiceLog().filter((e) => e.status === 'Failed').length);

  remove(e: ScheduleServiceLogEntry): void {
    if (!confirmDelete(`the ${e.serviceName} run log entry`)) return;
    this.setup.deleteScheduleServiceLogEntry(e.id);
  }
}
