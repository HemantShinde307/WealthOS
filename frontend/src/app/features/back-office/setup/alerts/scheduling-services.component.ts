import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ScheduledService } from '../setup-data.mock';
import { SetupService } from '../setup.service';

type StatusFilter = 'All' | ScheduledService['status'];

@Component({
  selector: 'app-scheduling-services',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './scheduling-services.component.html',
})
export class SchedulingServicesComponent {
  readonly setup = inject(SetupService);

  readonly searchTerm = signal('');
  readonly statusFilter = signal<StatusFilter>('All');

  readonly filtered = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const status = this.statusFilter();
    return this.setup.scheduledServices().filter((s) => {
      const matchesTerm = !term || s.name.toLowerCase().includes(term);
      const matchesStatus = status === 'All' || s.status === status;
      return matchesTerm && matchesStatus;
    });
  });

  readonly activeCount = computed(() => this.setup.scheduledServices().filter((s) => s.status === 'Active').length);
  readonly errorCount = computed(() => this.setup.scheduledServices().filter((s) => s.status === 'Error').length);

  togglePause(id: string): void {
    this.setup.toggleServicePause(id);
  }

  statusDotClass(status: ScheduledService['status']): string {
    if (status === 'Active') return 'bg-on-tertiary-container';
    if (status === 'Error') return 'bg-error';
    return 'bg-on-surface-variant';
  }
}
