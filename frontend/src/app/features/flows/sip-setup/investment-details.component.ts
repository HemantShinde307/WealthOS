import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SchemeService } from '../../../core/services/scheme.service';
import { SipSetupStateService } from './sip-setup-state.service';

@Component({
  selector: 'app-sip-investment-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './investment-details.component.html',
})
export class InvestmentDetailsComponent {
  private readonly schemeService = inject(SchemeService);
  readonly state = inject(SipSetupStateService);
  private readonly router = inject(Router);

  readonly scheme = computed(() => this.schemeService.getById(this.state.selectedSchemeId() ?? ''));
  readonly quickAmounts = [500, 1000, 2500, 5000, 10000];
  readonly sipDates = [1, 5, 10, 15, 20, 25];

  setAmount(value: number): void {
    this.state.amount.set(value);
  }

  onAmountInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.state.amount.set(isNaN(value) ? 0 : value);
  }

  continue(): void {
    this.router.navigate(['/sip-setup/mandate-selection']);
  }
}
