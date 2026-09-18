import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MutualFundService } from './mutual-fund.service';
import { MandateFrequency } from './mutual-fund-data.mock';

@Component({
  selector: 'app-mf-stp',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stp.component.html',
})
export class StpComponent {
  readonly mfService = inject(MutualFundService);

  readonly statusFilter = signal('All');
  readonly showForm = signal(false);

  readonly sourceFolioId = signal('');
  readonly targetFolioId = signal('');
  readonly amount = signal<number | null>(null);
  readonly frequency = signal<MandateFrequency>('Monthly');
  readonly startDate = signal(new Date().toISOString().slice(0, 10));
  readonly endDate = signal('');
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  readonly activeFolios = computed(() => this.mfService.folios().filter((f) => f.status === 'Active' && f.units > 0));
  readonly targetFolios = computed(() => this.mfService.folios().filter((f) => f.id !== this.sourceFolioId()));

  readonly filtered = computed(() => {
    const status = this.statusFilter();
    return this.mfService.stpMandates().filter((m) => status === 'All' || m.status === status);
  });

  folioLabel(id: string | undefined): string {
    if (!id) return '—';
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
    const sourceId = this.sourceFolioId();
    const targetId = this.targetFolioId();
    const amt = this.amount();
    if (!sourceId) { this.error.set('Select a source folio.'); return; }
    if (!targetId) { this.error.set('Select a target folio.'); return; }
    if (sourceId === targetId) { this.error.set('Source and target folios must be different.'); return; }
    if (!amt || amt <= 0) { this.error.set('Enter a valid transfer amount.'); return; }
    const mandate = this.mfService.createMandate({ type: 'STP', folioId: sourceId, targetFolioId: targetId, amount: amt, frequency: this.frequency(), startDate: this.startDate(), endDate: this.endDate() || undefined });
    if (!mandate) { this.error.set('Could not register this STP.'); return; }
    this.success.set(`STP ${mandate.id} registered — first transfer on ${mandate.startDate}.`);
    this.amount.set(null);
    this.sourceFolioId.set('');
    this.targetFolioId.set('');
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
