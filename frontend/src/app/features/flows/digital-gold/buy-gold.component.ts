import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TransactionService } from '../../../core/services/transaction.service';
import { AuthService } from '../../../core/services/auth.service';
import { DigitalGoldStateService } from './digital-gold-state.service';

@Component({
  selector: 'app-buy-gold',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './buy-gold.component.html',
})
export class BuyGoldComponent {
  private readonly transactionService = inject(TransactionService);
  private readonly auth = inject(AuthService);
  readonly state = inject(DigitalGoldStateService);
  private readonly router = inject(Router);

  readonly mode = signal<'amount' | 'grams'>('amount');
  readonly amount = signal(10000);
  readonly quickAmounts = [1000, 5000, 10000, 25000, 50000];
  readonly submitted = signal(false);
  readonly lastGrams = signal(0);

  readonly grams = computed(() => Number((this.amount() / this.state.currentRate()).toFixed(4)));
  readonly gst = computed(() => Number((this.amount() * 0.03).toFixed(2)));
  readonly totalPayable = computed(() => Number((this.amount() * 1.03).toFixed(2)));

  setAmount(value: number): void {
    this.amount.set(value);
  }

  onAmountInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.amount.set(isNaN(value) ? 0 : value);
  }

  confirm(): void {
    if (this.amount() <= 0) return;
    const txn = this.transactionService.add({
      clientId: this.auth.currentUser().customerId ?? 'CL-SELF',
      clientName: this.auth.currentUser().name,
      type: 'Gold Purchase',
      schemeName: 'Digital Gold (24K 999.9)',
      amount: this.totalPayable(),
      units: this.grams(),
      nav: this.state.currentRate(),
      status: 'Completed',
      date: new Date().toISOString().slice(0, 10),
    });
    this.lastGrams.set(this.grams());
    this.state.recordBuy(this.grams(), this.totalPayable(), txn.id);
    this.submitted.set(true);
  }

  goToGoldPortfolio(): void {
    this.router.navigate(['/investor/gold']);
  }
}
