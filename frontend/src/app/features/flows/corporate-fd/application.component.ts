import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CORPORATE_FD_OFFERS, CorporateFdStateService } from './corporate-fd-state.service';

let nextId = 501;

@Component({
  selector: 'app-corporate-fd-application',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './application.component.html',
})
export class ApplicationComponent {
  readonly state = inject(CorporateFdStateService);
  private readonly router = inject(Router);

  readonly submitted = signal(false);

  readonly offer = computed(() => CORPORATE_FD_OFFERS.find((o) => o.id === this.state.selectedOfferId()));

  readonly maturityValue = computed(() => {
    const o = this.offer();
    if (!o) return 0;
    const years = o.tenureMonths / 12;
    return Math.round(this.state.amount() * Math.pow(1 + o.interestRate / 100, years));
  });

  readonly formValid = computed(() => {
    const o = this.offer();
    return !!o && this.state.amount() >= o.minInvestment && this.state.nomineeName().trim().length > 0;
  });

  onAmountInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.state.amount.set(isNaN(value) ? 0 : value);
  }

  submit(): void {
    if (!this.formValid()) return;
    this.state.lastApplicationId.set(`FDAPP-${nextId++}`);
    this.submitted.set(true);
  }

  goToPortfolio(): void {
    this.state.reset();
    this.router.navigate(['/investor/fixed-income']);
  }
}
