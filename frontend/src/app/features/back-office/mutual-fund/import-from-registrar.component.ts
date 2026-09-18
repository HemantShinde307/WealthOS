import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MutualFundService, RegistrarImportRow } from './mutual-fund.service';
import { MfTransactionType } from './mutual-fund-data.mock';

interface ParsedRow extends RegistrarImportRow {
  valid: boolean;
  issue?: string;
}

const VALID_TYPES = new Set<MfTransactionType>(['Purchase', 'Additional Purchase', 'Redemption', 'SIP', 'SWP', 'STP In', 'STP Out']);

@Component({
  selector: 'app-mf-import-from-registrar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './import-from-registrar.component.html',
})
export class ImportFromRegistrarComponent {
  readonly mfService = inject(MutualFundService);

  readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');
  readonly registrar = signal<'CAMS' | 'KFintech'>('CAMS');
  readonly fileName = signal<string | null>(null);
  readonly parsedRows = signal<ParsedRow[]>([]);
  readonly error = signal<string | null>(null);
  readonly imported = signal<number | null>(null);

  readonly validCount = () => this.parsedRows().filter((r) => r.valid).length;

  openFilePicker(): void {
    this.fileInput().nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.error.set('Please select a .csv file (columns: folio,scheme,transactionType,amount,units,nav,date).');
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
      folio: header.indexOf('folio'),
      scheme: header.indexOf('scheme'),
      transactionType: header.indexOf('transactiontype'),
      amount: header.indexOf('amount'),
      units: header.indexOf('units'),
      nav: header.indexOf('nav'),
      date: header.indexOf('date'),
    };
    if (idx.folio === -1 || idx.transactionType === -1) {
      this.error.set('Header row must include at least "folio" and "transactionType" columns.');
      this.parsedRows.set([]);
      return;
    }

    const rows: ParsedRow[] = lines.slice(1).map((line) => {
      const cols = line.split(',').map((c) => c.trim());
      const folio = cols[idx.folio] ?? '';
      const scheme = idx.scheme >= 0 ? cols[idx.scheme] ?? '' : '';
      const transactionType = cols[idx.transactionType] ?? '';
      const amount = idx.amount >= 0 ? Number(cols[idx.amount]) || 0 : 0;
      const units = idx.units >= 0 ? Number(cols[idx.units]) || 0 : 0;
      const nav = idx.nav >= 0 ? Number(cols[idx.nav]) || 0 : 0;
      const date = idx.date >= 0 ? cols[idx.date] ?? '' : '';

      let valid = true;
      let issue: string | undefined;
      const matchedFolio = this.mfService.findFolioByNumber(folio);
      if (!folio) { valid = false; issue = 'Missing folio'; }
      else if (!matchedFolio) { valid = false; issue = 'Unknown folio'; }
      else if (!VALID_TYPES.has(transactionType as MfTransactionType)) { valid = false; issue = 'Unrecognised transaction type'; }
      else if (!amount || !units || !nav) { valid = false; issue = 'Missing amount/units/nav'; }
      else if (!date) { valid = false; issue = 'Missing date'; }

      return { folio, scheme: scheme || matchedFolio?.scheme || '', transactionType, amount, units, nav, date, valid, issue };
    });

    this.parsedRows.set(rows);
  }

  confirmImport(): void {
    const validRows = this.parsedRows().filter((r) => r.valid);
    if (!validRows.length || !this.fileName()) return;
    const applied = this.mfService.importRegistrarTransactions(validRows, this.fileName()!, this.registrar());
    this.imported.set(applied);
    this.parsedRows.set([]);
    this.fileName.set(null);
  }

  downloadTemplate(): void {
    const csv = 'folio,scheme,transactionType,amount,units,nav,date\n88214521/00,HDFC Flexi Cap Fund - Regular Growth,Additional Purchase,50000,24.49,2041.97,2026-09-15\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'registrar-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}
