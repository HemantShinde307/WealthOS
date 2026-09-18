import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LifeInsuranceService } from '../life-insurance.service';
import { LIFE_INSURERS, LIFE_POLICY_TYPES, LifeInsuranceImportRow, LifeInsurancePolicy } from '../insurance-investments-data.mock';

interface ParsedRow extends LifeInsuranceImportRow {
  valid: boolean;
  issue?: string;
}

const POLICY_TYPES = new Set(LIFE_POLICY_TYPES);
const FREQUENCIES = new Set<LifeInsurancePolicy['premiumFrequency']>(['Monthly', 'Quarterly', 'Half-Yearly', 'Annual']);

@Component({
  selector: 'app-life-insurance-import-data',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './import-data.component.html',
})
export class LifeInsuranceImportDataComponent {
  readonly svc = inject(LifeInsuranceService);
  readonly insurers = LIFE_INSURERS;

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
      this.error.set('Please select a .csv file (columns: policyNumber,policyholderName,insurer,policyType,sumAssured,premium,premiumFrequency).');
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
      policyNumber: header.indexOf('policynumber'),
      policyholderName: header.indexOf('policyholdername'),
      insurer: header.indexOf('insurer'),
      policyType: header.indexOf('policytype'),
      sumAssured: header.indexOf('sumassured'),
      premium: header.indexOf('premium'),
      premiumFrequency: header.indexOf('premiumfrequency'),
    };
    if (idx.policyNumber === -1 || idx.policyholderName === -1) {
      this.error.set('Header row must include at least "policyNumber" and "policyholderName" columns.');
      this.parsedRows.set([]);
      return;
    }

    const rows: ParsedRow[] = lines.slice(1).map((line) => {
      const cols = line.split(',').map((c) => c.trim());
      const policyNumber = cols[idx.policyNumber] ?? '';
      const policyholderName = cols[idx.policyholderName] ?? '';
      const insurer = idx.insurer >= 0 ? cols[idx.insurer] || this.insurers[0] : this.insurers[0];
      const typeRaw = idx.policyType >= 0 ? cols[idx.policyType] : '';
      const policyType = (POLICY_TYPES.has(typeRaw as any) ? typeRaw : 'Term Life') as LifeInsuranceImportRow['policyType'];
      const sumAssured = idx.sumAssured >= 0 ? Number(cols[idx.sumAssured]) || 0 : 0;
      const premium = idx.premium >= 0 ? Number(cols[idx.premium]) || 0 : 0;
      const freqRaw = idx.premiumFrequency >= 0 ? cols[idx.premiumFrequency] : '';
      const premiumFrequency = (FREQUENCIES.has(freqRaw as any) ? freqRaw : 'Annual') as LifeInsuranceImportRow['premiumFrequency'];

      let valid = true;
      let issue: string | undefined;
      if (!policyNumber) { valid = false; issue = 'Missing policy number'; }
      else if (!policyholderName) { valid = false; issue = 'Missing policyholder name'; }
      else if (!sumAssured) { valid = false; issue = 'Missing/invalid sum assured'; }

      return { policyNumber, policyholderName, insurer, policyType, sumAssured, premium, premiumFrequency, valid, issue };
    });

    this.parsedRows.set(rows);
  }

  confirmImport(): void {
    const validRows = this.parsedRows().filter((r) => r.valid);
    if (!validRows.length || !this.fileName()) return;
    this.svc.importPolicies(validRows, this.fileName()!);
    this.imported.set(true);
    this.parsedRows.set([]);
    this.fileName.set(null);
  }

  downloadTemplate(): void {
    const csv = 'policyNumber,policyholderName,insurer,policyType,sumAssured,premium,premiumFrequency\nLIC-990011223,Asha Rao,LIC of India,Term Life,5000000,12500,Annual\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'life-insurance-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}
