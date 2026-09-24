import { Component, Input } from '@angular/core';
import { CsvCell, downloadCsv } from '../../utils/csv-export';

@Component({
  selector: 'app-export-button',
  standalone: true,
  template: `
    <button
      type="button"
      class="inline-flex items-center gap-1.5 px-4 py-2 border border-outline-variant bg-surface-container-lowest text-on-surface rounded-md hover:bg-surface-container-low transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      [disabled]="!rows.length"
      (click)="export()"
    >
      <span class="material-symbols-outlined text-[18px]">download</span>
      Export
    </button>
  `,
})
export class ExportButtonComponent {
  @Input({ required: true }) filename = '';
  @Input({ required: true }) headers: string[] = [];
  @Input({ required: true }) rows: CsvCell[][] = [];

  export(): void {
    downloadCsv(this.filename, this.headers, this.rows);
  }
}
