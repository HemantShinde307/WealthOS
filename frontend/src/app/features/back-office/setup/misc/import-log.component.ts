import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SetupImportLogEntry } from '../setup-data.mock';
import { SetupService } from '../setup.service';

type StatusFilter = 'All' | SetupImportLogEntry['status'];

@Component({
  selector: 'app-import-log',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './import-log.component.html',
})
export class ImportLogComponent {
  readonly setup = inject(SetupService);

  readonly searchTerm = signal('');
  readonly statusFilter = signal<StatusFilter>('All');

  readonly filtered = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const status = this.statusFilter();
    return this.setup.setupImportLog().filter((e) => {
      const matchesTerm = !term || `${e.module} ${e.fileName} ${e.importedBy}`.toLowerCase().includes(term);
      const matchesStatus = status === 'All' || e.status === status;
      return matchesTerm && matchesStatus;
    });
  });

  readonly failedCount = computed(() => this.setup.setupImportLog().filter((e) => e.status === 'Failed').length);
  readonly totalRows = computed(() => this.setup.setupImportLog().reduce((sum, e) => sum + e.rowCount, 0));
}
