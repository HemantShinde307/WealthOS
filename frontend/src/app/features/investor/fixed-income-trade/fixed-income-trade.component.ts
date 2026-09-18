import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FIXED_INCOME_INSTRUMENTS } from '../fixed-income/fixed-income-data';

@Component({
  selector: 'app-fixed-income-trade',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './fixed-income-trade.component.html',
})
export class FixedIncomeTradeComponent {
  readonly instruments = FIXED_INCOME_INSTRUMENTS;
  readonly selectedId = signal(this.instruments[0].id);
  readonly orderType = signal<'Buy' | 'Sell'>('Buy');
  readonly quantity = signal(10);
  readonly submitted = signal(false);

  readonly selected = computed(() => this.instruments.find((i) => i.id === this.selectedId())!);
  readonly estimatedValue = computed(() => this.selected().faceValue * this.quantity());

  onQuantityInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.quantity.set(isNaN(value) ? 0 : value);
  }

  placeOrder(): void {
    this.submitted.set(true);
  }

  newOrder(): void {
    this.submitted.set(false);
  }
}
