import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ScheduledService } from '../setup-data.mock';
import { SetupService } from '../setup.service';
import { ExportButtonComponent } from '../../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../../shared/utils/confirm';

type StatusFilter = 'All' | ScheduledService['status'];

@Component({
  selector: 'app-scheduling-services',
  standalone: true,
  imports: [CommonModule, RouterLink, ExportButtonComponent],
  templateUrl: './scheduling-services.component.html',
})
export class SchedulingServicesComponent {
  readonly setup = inject(SetupService);

  readonly exportHeaders = ['Service', 'Frequency', 'Last Run', 'Next Run', 'Status'];
  readonly exportRows = computed(() =>
    this.filtered().map((s) => [s.name, s.frequency, s.lastRun, s.nextRun, s.status]),
  );

  readonly searchTerm = signal('');
  readonly statusFilter = signal<StatusFilter>('All');

  readonly editingId = signal<string | null>(null);
  readonly name = signal('');
  readonly frequency = signal('');
  readonly nextRun = signal('');
  readonly editStatus = signal<ScheduledService['status']>('Active');
  readonly error = signal<string | null>(null);

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

  edit(s: ScheduledService): void {
    this.editingId.set(s.id);
    this.name.set(s.name);
    this.frequency.set(s.frequency);
    this.nextRun.set(s.nextRun);
    this.editStatus.set(s.status);
    this.error.set(null);
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  saveEdit(): void {
    const id = this.editingId();
    if (!id) return;
    if (!this.name().trim() || !this.frequency().trim()) {
      this.error.set('Service name and frequency are required.');
      return;
    }
    this.setup.updateScheduledService(id, {
      name: this.name().trim(),
      frequency: this.frequency().trim(),
      nextRun: this.nextRun().trim(),
      status: this.editStatus(),
    });
    this.editingId.set(null);
  }

  remove(s: ScheduledService): void {
    if (!confirmDelete(`the ${s.name} service`)) return;
    this.setup.deleteScheduledService(s.id);
    if (this.editingId() === s.id) this.editingId.set(null);
  }
}
