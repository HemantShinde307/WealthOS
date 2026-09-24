import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrokerImportRow, MutualFundService } from './mutual-fund.service';
import { BrokerRecord } from './mutual-fund-data.mock';
import { ExportButtonComponent } from '../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../shared/utils/confirm';

interface ParsedRow extends BrokerImportRow {
  valid: boolean;
  issue?: string;
}

@Component({
  selector: 'app-mf-import-principal-broker-data',
  standalone: true,
  imports: [CommonModule, ExportButtonComponent],
  templateUrl: './import-principal-broker-data.component.html',
})
export class ImportPrincipalBrokerDataComponent {
  readonly mfService = inject(MutualFundService);

  readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');
  readonly fileName = signal<string | null>(null);
  readonly parsedRows = signal<ParsedRow[]>([]);
  readonly error = signal<string | null>(null);
  readonly imported = signal<number | null>(null);

  readonly previewExportHeaders = ['Broker Code', 'Broker Name', 'ARN', 'EUIN', 'Folio', 'Status'];
  readonly previewExportRows = computed(() =>
    this.parsedRows().map((r) => [r.brokerCode, r.brokerName, r.arn, r.euin, r.folio, r.valid ? 'Ready' : (r.issue ?? 'Invalid')]),
  );

  readonly exportHeaders = ['Broker Code', 'Broker Name', 'ARN', 'EUIN', 'Folio'];
  readonly exportRows = computed(() =>
    this.mfService.brokerRecords().map((b) => [b.brokerCode, b.brokerName, b.arn, b.euin, this.mfService.getFolio(b.folioId)?.folioNumber ?? b.folioId]),
  );

  readonly editingId = signal<string | null>(null);
  readonly editBrokerCode = signal('');
  readonly editBrokerName = signal('');
  readonly editArn = signal('');
  readonly editEuin = signal('');
  readonly editError = signal<string | null>(null);

  startEdit(b: BrokerRecord): void {
    this.editingId.set(b.id);
    this.editBrokerCode.set(b.brokerCode);
    this.editBrokerName.set(b.brokerName);
    this.editArn.set(b.arn);
    this.editEuin.set(b.euin);
    this.editError.set(null);
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  saveEdit(): void {
    const id = this.editingId();
    if (!id) return;
    if (!this.editBrokerCode().trim() || !this.editArn().trim()) {
      this.editError.set('Broker code and ARN are required.');
      return;
    }
    this.mfService.updateBrokerRecord(id, {
      brokerCode: this.editBrokerCode().trim(),
      brokerName: this.editBrokerName().trim(),
      arn: this.editArn().trim(),
      euin: this.editEuin().trim(),
    });
    this.editingId.set(null);
  }

  remove(b: BrokerRecord): void {
    if (!confirmDelete(`the broker mapping ${b.brokerCode} for this folio`)) return;
    this.mfService.deleteBrokerRecord(b.id);
    if (this.editingId() === b.id) this.editingId.set(null);
  }

  readonly validCount = () => this.parsedRows().filter((r) => r.valid).length;

  openFilePicker(): void {
    this.fileInput().nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.error.set('Please select a .csv file (columns: brokerCode,brokerName,arn,euin,folio).');
      return;
    }
    this.fileName.set(file.name);
    this.error.set(null);
    this.imported.set(null);
    const reader = new FileReader();
    reader.onload = () => this.parseCsv(String(reader.result ?? ''));
    reader.onerror = () => this.error.set('Could not read this file. Please try again.');
    reader.readAsText(file);
  }

  private parseCsv(text: string): void {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      this.error.set('The file has no data rows below the header.');
      this.parsedRows.set([]);
      return;
    }
    const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const idx = {
      brokerCode: header.indexOf('brokercode'),
      brokerName: header.indexOf('brokername'),
      arn: header.indexOf('arn'),
      euin: header.indexOf('euin'),
      folio: header.indexOf('folio'),
    };
    if (idx.brokerCode === -1 || idx.folio === -1) {
      this.error.set('Header row must include at least "brokerCode" and "folio" columns.');
      this.parsedRows.set([]);
      return;
    }

    const rows: ParsedRow[] = lines.slice(1).map((line) => {
      const cols = line.split(',').map((c) => c.trim());
      const brokerCode = cols[idx.brokerCode] ?? '';
      const brokerName = idx.brokerName >= 0 ? cols[idx.brokerName] ?? '' : '';
      const arn = idx.arn >= 0 ? cols[idx.arn] ?? '' : '';
      const euin = idx.euin >= 0 ? cols[idx.euin] ?? '' : '';
      const folio = cols[idx.folio] ?? '';

      let valid = true;
      let issue: string | undefined;
      const matchedFolio = this.mfService.findFolioByNumber(folio);
      if (!brokerCode) { valid = false; issue = 'Missing broker code'; }
      else if (!arn) { valid = false; issue = 'Missing ARN'; }
      else if (!folio) { valid = false; issue = 'Missing folio'; }
      else if (!matchedFolio) { valid = false; issue = 'Unknown folio'; }

      return { brokerCode, brokerName, arn, euin, folio, valid, issue };
    });

    this.parsedRows.set(rows);
  }

  confirmImport(): void {
    const validRows = this.parsedRows().filter((r) => r.valid);
    if (!validRows.length) return;
    const applied = this.mfService.importBrokerRecords(validRows);
    this.imported.set(applied);
    this.parsedRows.set([]);
    this.fileName.set(null);
  }

  downloadTemplate(): void {
    const csv = 'brokerCode,brokerName,arn,euin,folio\nBRK0142,Adapt Wealth Advisors Pvt Ltd,ARN-45678,E123456,88214521/00\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'principal-broker-data-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}
