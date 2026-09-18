import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GoldSipStateService } from './gold-sip-state.service';

@Component({
  selector: 'app-gold-sip-investment-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './investment-details.component.html',
})
export class InvestmentDetailsComponent {
  readonly state = inject(GoldSipStateService);
  private readonly router = inject(Router);

  readonly currentRate = 7842;
  readonly quickAmounts = [500, 1000, 2500, 5000, 10000];

  readonly gramsPerInstalment = computed(() => Number((this.state.amount() / this.currentRate).toFixed(4)));
  readonly annualInvestment = computed(() => this.state.amount() * (this.state.frequency() === 'Weekly' ? 52 : 12));

  setAmount(value: number): void {
    this.state.amount.set(value);
  }

  onAmountInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.state.amount.set(isNaN(value) ? 0 : value);
  }

  continue(): void {
    this.router.navigate(['/gold-sip/review-confirm']);
  }
}
