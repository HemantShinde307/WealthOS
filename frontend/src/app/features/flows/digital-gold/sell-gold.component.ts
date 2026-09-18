import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TransactionService } from '../../../core/services/transaction.service';
import { AuthService } from '../../../core/services/auth.service';
import { DigitalGoldStateService } from './digital-gold-state.service';

@Component({
  selector: 'app-sell-gold',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sell-gold.component.html',
})
export class SellGoldComponent {
  private readonly transactionService = inject(TransactionService);
  private readonly auth = inject(AuthService);
  readonly state = inject(DigitalGoldStateService);
  private readonly router = inject(Router);

  readonly grams = signal(5);
  readonly submitted = signal(false);
  readonly lastGrams = signal(0);
  readonly lastPayout = signal(0);

  readonly payout = computed(() => Number((this.grams() * this.state.currentRate()).toFixed(2)));
  readonly exceedsBalance = computed(() => this.grams() > this.state.holdingsGrams());

  onGramsInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.grams.set(isNaN(value) ? 0 : value);
  }

  setMax(): void {
    this.grams.set(this.state.holdingsGrams());
  }

  confirm(): void {
    if (this.grams() <= 0 || this.exceedsBalance()) return;
    const txn = this.transactionService.add({
      clientId: this.auth.currentUser().customerId ?? 'CL-SELF',
      clientName: this.auth.currentUser().name,
      type: 'Gold Sell',
      schemeName: 'Digital Gold (24K 999.9)',
      amount: this.payout(),
      units: this.grams(),
      nav: this.state.currentRate(),
      status: 'Completed',
      date: new Date().toISOString().slice(0, 10),
    });
    this.lastGrams.set(this.grams());
    this.lastPayout.set(this.payout());
    this.state.recordSell(this.grams(), this.payout(), txn.id);
    this.submitted.set(true);
  }

  goToGoldPortfolio(): void {
    this.router.navigate(['/investor/gold']);
  }
}
