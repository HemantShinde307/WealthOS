import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OtherInvestmentsService } from '../other-investments.service';
import { OtherInvestmentImportRow } from '../insurance-investments-data.mock';

interface ParsedRow extends OtherInvestmentImportRow {
  valid: boolean;
  issue?: string;
}

const CATEGORIES = new Set<OtherInvestmentImportRow['category']>(['Stock', 'Bond', 'Debenture', 'FD/RD', 'Postal', 'Company Deposit', 'Bullion', 'Other']);

@Component({
  selector: 'app-other-investments-import-data',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './import-data.component.html',
})
export class OtherInvestmentsImportDataComponent {
  readonly svc = inject(OtherInvestmentsService);

  readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');
  readonly fileName = signal<string | null>(null);
  readonly parsedRows = signal<ParsedRow[]>([]);
  readonly error = signal<string | null>(null);
  readonly imported = signal(false);

  readonly validCount = () => this.parsedRows().filter((r) => r.valid).length;

  openFilePicker(): void {
    this.fileInput().nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.error.set('Please select a .csv file (columns: category,customerName,instrumentName,amount,date).');
      return;
    }
    this.fileName.set(file.name);
    this.error.set(null);
    this.imported.set(false);
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
      category: header.indexOf('category'),
      customerName: header.indexOf('customername'),
      instrumentName: header.indexOf('instrumentname'),
      amount: header.indexOf('amount'),
      date: header.indexOf('date'),
    };
    if (idx.customerName === -1 || idx.instrumentName === -1) {
      this.error.set('Header row must include at least "customerName" and "instrumentName" columns.');
      this.parsedRows.set([]);
      return;
    }

    const rows: ParsedRow[] = lines.slice(1).map((line) => {
      const cols = line.split(',').map((c) => c.trim());
      const categoryRaw = idx.category >= 0 ? cols[idx.category] : '';
      const category = (CATEGORIES.has(categoryRaw as any) ? categoryRaw : 'Other') as OtherInvestmentImportRow['category'];
      const customerName = cols[idx.customerName] ?? '';
      const instrumentName = cols[idx.instrumentName] ?? '';
      const amount = idx.amount >= 0 ? Number(cols[idx.amount]) || 0 : 0;
      const date = idx.date >= 0 ? cols[idx.date] || new Date().toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);

      let valid = true;
      let issue: string | undefined;
      if (!customerName) { valid = false; issue = 'Missing customer name'; }
      else if (!instrumentName) { valid = false; issue = 'Missing instrument name'; }
      else if (!amount) { valid = false; issue = 'Missing/invalid amount'; }

      return { category, customerName, instrumentName, amount, date, valid, issue };
    });

    this.parsedRows.set(rows);
  }

  confirmImport(): void {
    const validRows = this.parsedRows().filter((r) => r.valid);
    if (!validRows.length || !this.fileName()) return;
    this.svc.importOtherInvestments(validRows, this.fileName()!);
    this.imported.set(true);
    this.parsedRows.set([]);
    this.fileName.set(null);
  }

  downloadTemplate(): void {
    const csv = 'category,customerName,instrumentName,amount,date\nStock,Asha Rao,INFY,150000,2026-06-01\nBond,Asha Rao,7.10% GOI Savings Bond 2034,100000,2026-06-01\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'other-investments-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}
