import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OtherInvestmentsService } from '../other-investments.service';
import { BondHolding } from '../insurance-investments-data.mock';

@Component({
  selector: 'app-other-investments-bonds',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bonds.component.html',
})
export class BondsComponent {
  readonly svc = inject(OtherInvestmentsService);

  readonly editingId = signal<string | null>(null);
  readonly formVisible = signal(false);
  readonly customerName = signal('');
  readonly issuer = signal('');
  readonly isin = signal('');
  readonly faceValue = signal<number | null>(null);
  readonly quantity = signal<number | null>(null);
  readonly couponRate = signal<number | null>(null);
  readonly purchaseDate = signal(new Date().toISOString().slice(0, 10));
  readonly maturityDate = signal(new Date().toISOString().slice(0, 10));
  readonly error = signal<string | null>(null);

  openNew(): void {
    this.editingId.set(null);
    this.customerName.set('');
    this.issuer.set('');
    this.isin.set('');
    this.faceValue.set(null);
    this.quantity.set(null);
    this.couponRate.set(null);
    this.purchaseDate.set(new Date().toISOString().slice(0, 10));
    this.maturityDate.set(new Date().toISOString().slice(0, 10));
    this.error.set(null);
    this.formVisible.set(true);
  }

  edit(b: BondHolding): void {
    this.editingId.set(b.id);
    this.customerName.set(b.customerName);
    this.issuer.set(b.issuer);
    this.isin.set(b.isin);
    this.faceValue.set(b.faceValue);
    this.quantity.set(b.quantity);
    this.couponRate.set(b.couponRate);
    this.purchaseDate.set(b.purchaseDate);
    this.maturityDate.set(b.maturityDate);
    this.error.set(null);
    this.formVisible.set(true);
  }

  cancel(): void {
    this.formVisible.set(false);
  }

  save(): void {
    if (!this.customerName().trim() || !this.issuer().trim() || !this.faceValue() || !this.quantity()) {
      this.error.set('Customer, issuer, face value and quantity are required.');
      return;
    }
    const payload = {
      customerName: this.customerName().trim(),
      issuer: this.issuer().trim(),
      isin: this.isin().trim() || '—',
      faceValue: this.faceValue()!,
      quantity: this.quantity()!,
      couponRate: this.couponRate() ?? 0,
      purchaseDate: this.purchaseDate(),
      maturityDate: this.maturityDate(),
    };
    const id = this.editingId();
    if (id) this.svc.updateBond(id, payload);
    else this.svc.addBond(payload);
    this.formVisible.set(false);
  }

  remove(id: string): void {
    this.svc.deleteBond(id);
  }
}
