import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneralInsuranceService } from '../general-insurance.service';
import { GENERAL_INSURERS, GENERAL_POLICY_TYPES, GeneralInsuranceImportRow } from '../insurance-investments-data.mock';

interface ParsedRow extends GeneralInsuranceImportRow {
  valid: boolean;
  issue?: string;
}

const TYPES = new Set(GENERAL_POLICY_TYPES);

@Component({
  selector: 'app-general-insurance-import-policies',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './import-policies.component.html',
})
export class GeneralInsuranceImportPoliciesComponent {
  readonly svc = inject(GeneralInsuranceService);
  readonly insurers = GENERAL_INSURERS;

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
    if (!file.name.toLowerCase().endsWith('.csv') && !file.name.toLowerCase().endsWith('.xlsx')) {
      this.error.set('Please select a .csv or .xlsx export (columns: policyNumber,policyholderName,insurer,type,sumInsured,premium,renewalDate).');
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
      type: header.indexOf('type'),
      sumInsured: header.indexOf('suminsured'),
      premium: header.indexOf('premium'),
      renewalDate: header.indexOf('renewaldate'),
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
      const typeRaw = idx.type >= 0 ? cols[idx.type] : '';
      const type = (TYPES.has(typeRaw as any) ? typeRaw : 'Motor') as GeneralInsuranceImportRow['type'];
      const sumInsured = idx.sumInsured >= 0 ? Number(cols[idx.sumInsured]) || 0 : 0;
      const premium = idx.premium >= 0 ? Number(cols[idx.premium]) || 0 : 0;
      const renewalDate = idx.renewalDate >= 0 ? cols[idx.renewalDate] || new Date().toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);

      let valid = true;
      let issue: string | undefined;
      if (!policyNumber) { valid = false; issue = 'Missing policy number'; }
      else if (!policyholderName) { valid = false; issue = 'Missing policyholder name'; }
      else if (!sumInsured) { valid = false; issue = 'Missing/invalid sum insured'; }

      return { policyNumber, policyholderName, insurer, type, sumInsured, premium, renewalDate, valid, issue };
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
    const csv = 'policyNumber,policyholderName,insurer,type,sumInsured,premium,renewalDate\nICL-MOT-11223,Asha Rao,ICICI Lombard,Motor,800000,18500,2027-01-01\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'general-insurance-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}
