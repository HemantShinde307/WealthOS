import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ScheduleServiceLogEntry } from '../setup-data.mock';
import { SetupService } from '../setup.service';

type StatusFilter = 'All' | ScheduleServiceLogEntry['status'];

@Component({
  selector: 'app-schedule-service-log',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './schedule-service-log.component.html',
})
export class ScheduleServiceLogComponent {
  readonly setup = inject(SetupService);

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
}
