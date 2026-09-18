import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MutualFundService } from './mutual-fund.service';
import { MandateFrequency } from './mutual-fund-data.mock';

@Component({
  selector: 'app-mf-sip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sip.component.html',
})
export class SipComponent {
  readonly mfService = inject(MutualFundService);

  readonly statusFilter = signal('All');
  readonly showForm = signal(false);

  readonly folioId = signal('');
  readonly amount = signal<number | null>(null);
  readonly frequency = signal<MandateFrequency>('Monthly');
  readonly startDate = signal(new Date().toISOString().slice(0, 10));
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  readonly activeFolios = computed(() => this.mfService.folios().filter((f) => f.status === 'Active'));

  readonly filtered = computed(() => {
    const status = this.statusFilter();
    return this.mfService.sipMandates().filter((m) => status === 'All' || m.status === status);
  });

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
    if (!amt || amt <= 0) { this.error.set('Enter a valid installment amount.'); return; }
    const mandate = this.mfService.createMandate({ type: 'SIP', folioId, amount: amt, frequency: this.frequency(), startDate: this.startDate() });
    if (!mandate) { this.error.set('Could not register this SIP.'); return; }
    this.success.set(`SIP ${mandate.id} registered — first installment on ${mandate.startDate}.`);
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
