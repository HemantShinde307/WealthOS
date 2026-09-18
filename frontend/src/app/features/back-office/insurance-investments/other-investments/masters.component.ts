import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OtherInvestmentsService } from '../other-investments.service';
import { InstrumentMaster } from '../insurance-investments-data.mock';

@Component({
  selector: 'app-other-investments-masters',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './masters.component.html',
})
export class OtherInvestmentsMastersComponent {
  readonly svc = inject(OtherInvestmentsService);
  readonly categories: InstrumentMaster['category'][] = ['Bond', 'Debenture', 'Company Deposit', 'Postal Scheme', 'Bank Deposit', 'Other'];

  readonly editingId = signal<string | null>(null);
  readonly formVisible = signal(false);
  readonly category = signal<InstrumentMaster['category']>('Bond');
  readonly name = signal('');
  readonly code = signal('');
  readonly issuer = signal('');
  readonly notes = signal('');
  readonly error = signal<string | null>(null);

  openNew(): void {
    this.editingId.set(null);
    this.category.set('Bond');
    this.name.set('');
    this.code.set('');
    this.issuer.set('');
    this.notes.set('');
    this.error.set(null);
    this.formVisible.set(true);
  }

  edit(m: InstrumentMaster): void {
    this.editingId.set(m.id);
    this.category.set(m.category);
    this.name.set(m.name);
    this.code.set(m.code);
    this.issuer.set(m.issuer);
    this.notes.set(m.notes);
    this.error.set(null);
    this.formVisible.set(true);
  }

  cancel(): void {
    this.formVisible.set(false);
  }

  save(): void {
    if (!this.name().trim() || !this.issuer().trim()) {
      this.error.set('Instrument name and issuer are required.');
      return;
    }
    const payload = { category: this.category(), name: this.name().trim(), code: this.code().trim() || '—', issuer: this.issuer().trim(), notes: this.notes().trim() };
    const id = this.editingId();
    if (id) this.svc.updateMaster(id, payload);
    else this.svc.addMaster(payload);
    this.formVisible.set(false);
  }

  remove(id: string): void {
    this.svc.deleteMaster(id);
  }
}
