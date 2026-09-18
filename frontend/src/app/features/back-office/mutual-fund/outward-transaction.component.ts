import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MutualFundService } from './mutual-fund.service';

@Component({
  selector: 'app-mf-outward',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './outward-transaction.component.html',
})
export class OutwardTransactionComponent {
  readonly mfService = inject(MutualFundService);

  readonly folioQuery = signal('');
  readonly selectedFolioId = signal<string | null>(null);
  readonly units = signal<number | null>(null);
  readonly nav = signal<number | null>(null);
  readonly date = signal(new Date().toISOString().slice(0, 10));
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  readonly matches = computed(() => {
    const q = this.folioQuery().trim().toLowerCase();
    if (!q || this.selectedFolioId()) return [];
    return this.mfService
      .folios()
      .filter((f) => f.status === 'Active' && (f.folioNumber.toLowerCase().includes(q) || f.customerName.toLowerCase().includes(q) || f.scheme.toLowerCase().includes(q)))
      .slice(0, 8);
  });

  readonly selectedFolio = computed(() => {
    const id = this.selectedFolioId();
    return id ? this.mfService.getFolio(id) : undefined;
  });

  readonly computedAmount = computed(() => {
    const u = this.units();
    const navVal = this.nav();
    if (!u || !navVal) return 0;
    return Math.round(u * navVal * 100) / 100;
  });

  readonly exceedsHolding = computed(() => {
    const f = this.selectedFolio();
    const u = this.units();
    return !!f && !!u && u > f.units;
  });

  readonly recentOutward = computed(() => this.mfService.transactions().filter((t) => t.transactionType === 'Redemption').slice(0, 12));

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
    this.units.set(null);
    this.nav.set(null);
  }

  redeemAll(): void {
    const f = this.selectedFolio();
    if (f) this.units.set(f.units);
  }

  submit(): void {
    this.error.set(null);
    this.success.set(null);
    const folioId = this.selectedFolioId();
    const u = this.units();
    const navVal = this.nav();
    const folio = this.selectedFolio();
    if (!folioId || !folio) { this.error.set('Look up and select a folio first.'); return; }
    if (!u || u <= 0) { this.error.set('Enter a valid unit quantity.'); return; }
    if (u > folio.units) { this.error.set(`Cannot redeem more than the available balance of ${folio.units} units.`); return; }
    if (!navVal || navVal <= 0) { this.error.set('Enter a valid NAV.'); return; }
    const txn = this.mfService.recordOutward(folioId, u, navVal, this.date());
    if (!txn) { this.error.set('Could not record this redemption.'); return; }
    this.success.set(`Redemption of ${u} units recorded — ₹${txn.amount.toLocaleString('en-IN')} payable.`);
    this.units.set(null);
  }
}
