import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MutualFundService } from './mutual-fund.service';
import { MandateFrequency, SystematicMandate } from './mutual-fund-data.mock';
import { ExportButtonComponent } from '../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../shared/utils/confirm';

@Component({
  selector: 'app-mf-swp',
  standalone: true,
  imports: [CommonModule, ExportButtonComponent],
  templateUrl: './swp.component.html',
})
export class SwpComponent {
  readonly mfService = inject(MutualFundService);

  readonly statusFilter = signal('All');
  readonly showForm = signal(false);

  readonly folioId = signal('');
  readonly amount = signal<number | null>(null);
  readonly frequency = signal<MandateFrequency>('Monthly');
  readonly startDate = signal(new Date().toISOString().slice(0, 10));
  readonly endDate = signal('');
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  readonly activeFolios = computed(() => this.mfService.folios().filter((f) => f.status === 'Active' && f.units > 0));

  readonly filtered = computed(() => {
    const status = this.statusFilter();
    return this.mfService.swpMandates().filter((m) => status === 'All' || m.status === status);
  });

  readonly exportHeaders = ['Mandate ID', 'Folio', 'Scheme', 'Amount', 'Frequency', 'Start Date', 'Next Due', 'End Date', 'Status'];
  readonly exportRows = computed(() =>
    this.filtered().map((m) => [m.id, this.folioLabel(m.folioId), m.scheme, m.amount, m.frequency, m.startDate, m.nextDueDate, m.endDate ?? '', m.status]),
  );

  readonly editingId = signal<string | null>(null);
  readonly editAmount = signal<number | null>(null);
  readonly editFrequency = signal<MandateFrequency>('Monthly');
  readonly editNextDue = signal('');
  readonly editEndDate = signal('');
  readonly editError = signal<string | null>(null);

  startEdit(m: SystematicMandate): void {
    this.editingId.set(m.id);
    this.editAmount.set(m.amount);
    this.editFrequency.set(m.frequency);
    this.editNextDue.set(m.nextDueDate);
    this.editEndDate.set(m.endDate ?? '');
    this.editError.set(null);
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  saveEdit(): void {
    const id = this.editingId();
    if (!id) return;
    const amt = this.editAmount();
    if (!amt || amt <= 0) { this.editError.set('Enter a valid amount.'); return; }
    if (!this.editNextDue()) { this.editError.set('Enter the next due date.'); return; }
    this.mfService.updateMandate(id, { amount: amt, frequency: this.editFrequency(), nextDueDate: this.editNextDue(), endDate: this.editEndDate() || undefined });
    this.editingId.set(null);
  }

  remove(m: SystematicMandate): void {
    if (!confirmDelete(`the SWP mandate ${m.id}`)) return;
    this.mfService.deleteMandate(m.id);
    if (this.editingId() === m.id) this.editingId.set(null);
  }

  folioLabel(id: string): string {
    const f = this.mfService.getFolio(id);
    return f ? `${f.folioNumber} — ${f.customerName} (${f.scheme})` : id;
  }

  toggleForm(): void {
    this.showForm.update((v) => !v);
    this.error.set(null);
    this.success.set(null);
  }

  register(): void {
    this.error.set(null);
    this.success.set(null);
    const folioId = this.folioId();
    const amt = this.amount();
    if (!folioId) { this.error.set('Select a folio.'); return; }
    if (!amt || amt <= 0) { this.error.set('Enter a valid withdrawal amount.'); return; }
    const mandate = this.mfService.createMandate({ type: 'SWP', folioId, amount: amt, frequency: this.frequency(), startDate: this.startDate(), endDate: this.endDate() || undefined });
    if (!mandate) { this.error.set('Could not register this SWP.'); return; }
    this.success.set(`SWP ${mandate.id} registered — first withdrawal on ${mandate.startDate}.`);
    this.amount.set(null);
    this.folioId.set('');
  }

  pause(id: string): void {
    this.mfService.setMandateStatus(id, 'Paused');
  }

  resume(id: string): void {
    this.mfService.setMandateStatus(id, 'Active');
  }

  stop(id: string): void {
    this.mfService.setMandateStatus(id, 'Stopped');
  }
}
