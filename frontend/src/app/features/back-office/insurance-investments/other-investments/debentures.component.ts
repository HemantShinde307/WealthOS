import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OtherInvestmentsService } from '../other-investments.service';
import { DebentureHolding } from '../insurance-investments-data.mock';

@Component({
  selector: 'app-other-investments-debentures',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './debentures.component.html',
})
export class DebenturesComponent {
  readonly svc = inject(OtherInvestmentsService);

  readonly editingId = signal<string | null>(null);
  readonly formVisible = signal(false);
  readonly customerName = signal('');
  readonly issuer = signal('');
  readonly isin = signal('');
  readonly faceValue = signal<number | null>(null);
  readonly quantity = signal<number | null>(null);
  readonly interestRate = signal<number | null>(null);
  readonly convertible = signal(false);
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
    this.interestRate.set(null);
    this.convertible.set(false);
    this.purchaseDate.set(new Date().toISOString().slice(0, 10));
    this.maturityDate.set(new Date().toISOString().slice(0, 10));
    this.error.set(null);
    this.formVisible.set(true);
  }

  edit(d: DebentureHolding): void {
    this.editingId.set(d.id);
    this.customerName.set(d.customerName);
    this.issuer.set(d.issuer);
    this.isin.set(d.isin);
    this.faceValue.set(d.faceValue);
    this.quantity.set(d.quantity);
    this.interestRate.set(d.interestRate);
    this.convertible.set(d.convertible);
    this.purchaseDate.set(d.purchaseDate);
    this.maturityDate.set(d.maturityDate);
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
      interestRate: this.interestRate() ?? 0,
      convertible: this.convertible(),
      purchaseDate: this.purchaseDate(),
      maturityDate: this.maturityDate(),
    };
    const id = this.editingId();
    if (id) this.svc.updateDebenture(id, payload);
    else this.svc.addDebenture(payload);
    this.formVisible.set(false);
  }

  remove(id: string): void {
    this.svc.deleteDebenture(id);
  }
}
