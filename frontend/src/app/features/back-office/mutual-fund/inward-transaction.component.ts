import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MutualFundService } from './mutual-fund.service';

@Component({
  selector: 'app-mf-inward',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inward-transaction.component.html',
})
export class InwardTransactionComponent {
  readonly mfService = inject(MutualFundService);

  readonly folioQuery = signal('');
  readonly selectedFolioId = signal<string | null>(null);
  readonly transactionType = signal<'Purchase' | 'Additional Purchase'>('Additional Purchase');
  readonly amount = signal<number | null>(null);
  readonly nav = signal<number | null>(null);
  readonly date = signal(new Date().toISOString().slice(0, 10));
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  readonly matches = computed(() => {
    const q = this.folioQuery().trim().toLowerCase();
    if (!q || this.selectedFolioId()) return [];
    return this.mfService
      .folios()
      .filter((f) => f.folioNumber.toLowerCase().includes(q) || f.customerName.toLowerCase().includes(q) || f.scheme.toLowerCase().includes(q))
      .slice(0, 8);
  });

  readonly selectedFolio = computed(() => {
    const id = this.selectedFolioId();
    return id ? this.mfService.getFolio(id) : undefined;
  });

  readonly computedUnits = computed(() => {
    const amt = this.amount();
    const navVal = this.nav();
    if (!amt || !navVal || navVal <= 0) return 0;
    return Math.round((amt / navVal) * 1000) / 1000;
  });

  readonly recentInward = computed(() => this.mfService.transactions().filter((t) => t.transactionType === 'Purchase' || t.transactionType === 'Additional Purchase').slice(0, 12));

  selectFolio(id: string): void {
    const f = this.mfService.getFolio(id);
    this.selectedFolioId.set(id);
    this.folioQuery.set(f ? `${f.folioNumber} — ${f.customerName}` : '');
    this.nav.set(f?.currentNav ?? null);
    this.error.set(null);
    this.success.set(null);
  }

  clearSelection(): void {
    this.selectedFolioId.set(null);
    this.folioQuery.set('');
    this.amount.set(null);
    this.nav.set(null);
  }

  submit(): void {
    this.error.set(null);
    this.success.set(null);
    const folioId = this.selectedFolioId();
    const amt = this.amount();
    const navVal = this.nav();
    if (!folioId) { this.error.set('Look up and select a folio first.'); return; }
    if (!amt || amt <= 0) { this.error.set('Enter a valid amount.'); return; }
    if (!navVal || navVal <= 0) { this.error.set('Enter a valid NAV.'); return; }
    const txn = this.mfService.recordInward(folioId, this.transactionType(), amt, navVal, this.date());
    if (!txn) { this.error.set('Could not record this transaction.'); return; }
    this.success.set(`${this.transactionType()} of ₹${amt.toLocaleString('en-IN')} recorded — ${txn.units} units allotted.`);
    this.amount.set(null);
  }
}
