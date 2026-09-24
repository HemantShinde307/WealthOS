import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MutualFundService } from './mutual-fund.service';
import { MfTransaction } from './mutual-fund-data.mock';
import { ExportButtonComponent } from '../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../shared/utils/confirm';

@Component({
  selector: 'app-mf-outward',
  standalone: true,
  imports: [CommonModule, ExportButtonComponent],
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

  readonly exportHeaders = ['Date', 'Folio', 'Scheme', 'Units', 'NAV', 'Amount', 'Status', 'Source'];
  readonly exportRows = computed(() =>
    this.recentOutward().map((t) => [t.date, this.mfService.getFolio(t.folioId)?.folioNumber ?? t.folioId, t.scheme, t.units, t.nav, t.amount, t.status, t.source]),
  );

  readonly editingId = signal<string | null>(null);
  readonly editUnits = signal<number | null>(null);
  readonly editNav = signal<number | null>(null);
  readonly editDate = signal('');
  readonly editError = signal<string | null>(null);

  readonly editAmount = computed(() => {
    const u = this.editUnits();
    const navVal = this.editNav();
    if (!u || !navVal) return 0;
    return Math.round(u * navVal * 100) / 100;
  });

  startEdit(t: MfTransaction): void {
    this.editingId.set(t.id);
    this.editUnits.set(t.units);
    this.editNav.set(t.nav);
    this.editDate.set(t.date);
    this.editError.set(null);
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  saveEdit(): void {
    const id = this.editingId();
    if (!id) return;
    const txn = this.mfService.transactions().find((t) => t.id === id);
    const u = this.editUnits();
    const navVal = this.editNav();
    if (!txn) return;
    if (!u || u <= 0) { this.editError.set('Enter a valid unit quantity.'); return; }
    if (!navVal || navVal <= 0) { this.editError.set('Enter a valid NAV.'); return; }
    const folio = this.mfService.getFolio(txn.folioId);
    if (folio && u > folio.units + txn.units) { this.editError.set(`Cannot redeem more than the available balance of ${folio.units + txn.units} units.`); return; }
    this.mfService.updateTransaction(id, { units: u, nav: navVal, amount: this.editAmount(), date: this.editDate() });
    this.editingId.set(null);
  }

  remove(t: MfTransaction): void {
    if (!confirmDelete(`the redemption of ${t.units} units on ${t.date} (folio balance will be adjusted)`)) return;
    this.mfService.deleteTransaction(t.id);
    if (this.editingId() === t.id) this.editingId.set(null);
  }

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
