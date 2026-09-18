import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MutualFundService } from './mutual-fund.service';
import { MandateFrequency } from './mutual-fund-data.mock';

@Component({
  selector: 'app-mf-swp',
  standalone: true,
  imports: [CommonModule],
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
