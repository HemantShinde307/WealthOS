import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SchemeService } from '../../../core/services/scheme.service';
import { MfPurchaseStateService } from './mf-purchase-state.service';

@Component({
  selector: 'app-mf-investment-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './investment-details.component.html',
})
export class InvestmentDetailsComponent {
  private readonly schemeService = inject(SchemeService);
  readonly state = inject(MfPurchaseStateService);
  private readonly router = inject(Router);

  readonly scheme = computed(() => this.schemeService.getById(this.state.selectedSchemeId() ?? ''));
  readonly quickAmounts = [5000, 10000, 25000, 50000, 100000];
  readonly paymentModes: Array<'UPI' | 'Net Banking' | 'NEFT/RTGS'> = ['UPI', 'Net Banking', 'NEFT/RTGS'];

  setAmount(value: number): void {
    this.state.amount.set(value);
  }

  onAmountInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.state.amount.set(isNaN(value) ? 0 : value);
  }

  continue(): void {
    this.router.navigate(['/mf-purchase/review-confirm']);
  }
}
