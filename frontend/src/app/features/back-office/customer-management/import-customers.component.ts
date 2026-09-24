import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExportButtonComponent } from '../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../shared/utils/confirm';
import { ImportCustomerRow, BackOfficeCustomerService } from '../back-office-customer.service';

interface ParsedRow extends ImportCustomerRow {
  valid: boolean;
  issue?: string;
}

const RISK_PROFILES = new Set(['Conservative', 'Moderate', 'Aggressive']);
const SEGMENTS = new Set(['Retail', 'HNI', 'Corporate', 'NRI', 'Family Office']);

@Component({
  selector: 'app-import-customers',
  standalone: true,
  imports: [CommonModule, RouterLink, ExportButtonComponent],
  templateUrl: './import-customers.component.html',
})
export class ImportCustomersComponent {
  readonly boService = inject(BackOfficeCustomerService);

  readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');
  readonly fileName = signal<string | null>(null);
  readonly parsedRows = signal<ParsedRow[]>([]);
  readonly error = signal<string | null>(null);
  readonly imported = signal(false);

  readonly logHeaders = ['File', 'Rows Imported', 'Imported On'];
  readonly logRows = computed(() => this.boService.importLog().map((e) => [e.fileName, e.rowCount, e.importedOn]));

  removeLog(id: string, fileName: string): void {
    if (!confirmDelete(`the import log entry for ${fileName}`)) return;
    this.boService.deleteImportLog(id);
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
      this.error.set('Please select a .csv file (columns: name,email,phone,pan,riskProfile,segment).');
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
      name: header.indexOf('name'),
      email: header.indexOf('email'),
      phone: header.indexOf('phone'),
      pan: header.indexOf('pan'),
      riskProfile: header.indexOf('riskprofile'),
      segment: header.indexOf('segment'),
    };
    if (idx.name === -1 || idx.email === -1) {
      this.error.set('Header row must include at least "name" and "email" columns.');
      this.parsedRows.set([]);
      return;
    }

    const rows: ParsedRow[] = lines.slice(1).map((line) => {
      const cols = line.split(',').map((c) => c.trim());
      const name = cols[idx.name] ?? '';
      const email = cols[idx.email] ?? '';
      const phone = idx.phone >= 0 ? cols[idx.phone] ?? '' : '';
      const pan = idx.pan >= 0 ? cols[idx.pan] ?? '' : '';
      const riskRaw = idx.riskProfile >= 0 ? cols[idx.riskProfile] ?? '' : '';
      const segmentRaw = idx.segment >= 0 ? cols[idx.segment] ?? '' : '';
      const riskProfile = (RISK_PROFILES.has(riskRaw) ? riskRaw : 'Moderate') as ParsedRow['riskProfile'];
      const segment = (SEGMENTS.has(segmentRaw) ? segmentRaw : 'Retail') as ParsedRow['segment'];

      let valid = true;
      let issue: string | undefined;
      if (!name) { valid = false; issue = 'Missing name'; }
      else if (!email) { valid = false; issue = 'Missing email'; }

      return { name, email, phone, pan, riskProfile, segment, valid, issue };
    });

    this.parsedRows.set(rows);
  }

  confirmImport(): void {
    const validRows = this.parsedRows().filter((r) => r.valid);
    if (!validRows.length || !this.fileName()) return;
    this.boService.importCustomers(validRows, this.fileName()!);
    this.imported.set(true);
    this.parsedRows.set([]);
    this.fileName.set(null);
  }

  downloadTemplate(): void {
    const csv = 'name,email,phone,pan,riskProfile,segment\nAsha Rao,asha.rao@example.com,+91 90000 11111,ABCDE1234F,Moderate,Retail\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customer-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}
