import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OtherInvestmentsService } from '../other-investments.service';
import { StockHolding } from '../insurance-investments-data.mock';

@Component({
  selector: 'app-other-investments-stocks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stocks.component.html',
})
export class OtherInvestmentsStocksComponent {
  readonly svc = inject(OtherInvestmentsService);
  readonly exchanges: StockHolding['exchange'][] = ['NSE', 'BSE'];

  readonly editingId = signal<string | null>(null);
  readonly formVisible = signal(false);
  readonly customerName = signal('');
  readonly symbol = signal('');
  readonly exchange = signal<StockHolding['exchange']>('NSE');
  readonly quantity = signal<number | null>(null);
  readonly buyPrice = signal<number | null>(null);
  readonly currentPrice = signal<number | null>(null);
  readonly buyDate = signal(new Date().toISOString().slice(0, 10));
  readonly error = signal<string | null>(null);

  readonly rows = computed(() =>
    this.svc.stocks().map((s) => ({ ...s, gainLoss: (s.currentPrice - s.buyPrice) * s.quantity, value: s.currentPrice * s.quantity })),
  );

  openNew(): void {
    this.editingId.set(null);
    this.customerName.set('');
    this.symbol.set('');
    this.exchange.set('NSE');
    this.quantity.set(null);
    this.buyPrice.set(null);
    this.currentPrice.set(null);
    this.buyDate.set(new Date().toISOString().slice(0, 10));
    this.error.set(null);
    this.formVisible.set(true);
  }

  edit(s: StockHolding): void {
    this.editingId.set(s.id);
    this.customerName.set(s.customerName);
    this.symbol.set(s.symbol);
    this.exchange.set(s.exchange);
    this.quantity.set(s.quantity);
    this.buyPrice.set(s.buyPrice);
    this.currentPrice.set(s.currentPrice);
    this.buyDate.set(s.buyDate);
    this.error.set(null);
    this.formVisible.set(true);
  }

  cancel(): void {
    this.formVisible.set(false);
  }

  save(): void {
    if (!this.customerName().trim() || !this.symbol().trim() || !this.quantity() || !this.buyPrice()) {
      this.error.set('Customer, symbol, quantity and buy price are required.');
      return;
    }
    const payload = {
      customerName: this.customerName().trim(),
      symbol: this.symbol().trim().toUpperCase(),
      exchange: this.exchange(),
      quantity: this.quantity()!,
      buyPrice: this.buyPrice()!,
      currentPrice: this.currentPrice() ?? this.buyPrice()!,
      buyDate: this.buyDate(),
    };
    const id = this.editingId();
    if (id) this.svc.updateStock(id, payload);
    else this.svc.addStock(payload);
    this.formVisible.set(false);
  }

  remove(id: string): void {
    this.svc.deleteStock(id);
  }
}
