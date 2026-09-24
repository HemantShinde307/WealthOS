import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SetupImportLogEntry } from '../setup-data.mock';
import { SetupService } from '../setup.service';
import { ExportButtonComponent } from '../../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../../shared/utils/confirm';

type StatusFilter = 'All' | SetupImportLogEntry['status'];

@Component({
  selector: 'app-import-log',
  standalone: true,
  imports: [CommonModule, ExportButtonComponent],
  templateUrl: './import-log.component.html',
})
export class ImportLogComponent {
  readonly setup = inject(SetupService);

  readonly exportHeaders = ['Module', 'File Name', 'Rows', 'Imported By', 'Imported On', 'Status'];
  readonly exportRows = computed(() =>
    this.filtered().map((e) => [e.module, e.fileName, e.rowCount, e.importedBy, e.importedOn, e.status]),
  );

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

  remove(e: SetupImportLogEntry): void {
    if (!confirmDelete(`the import log entry for ${e.fileName}`)) return;
    this.setup.deleteSetupImportLogEntry(e.id);
  }
}
