import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-insurance-needs-analysis',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './insurance-needs-analysis.component.html',
})
export class InsuranceNeedsAnalysisComponent {
  readonly annualIncome = signal(1500000);
  readonly age = signal(35);
  readonly dependents = signal(2);
  readonly outstandingLoans = signal(2000000);
  readonly existingCover = signal(5000000);

  readonly incomeReplacementYears = computed(() => Math.max(10, 20 - this.age() / 5));
  readonly recommendedCover = computed(
    () => Math.round(this.annualIncome() * this.incomeReplacementYears() + this.outstandingLoans() + this.dependents() * 500000),
  );
  readonly gap = computed(() => Math.max(this.recommendedCover() - this.existingCover(), 0));
  readonly coveragePct = computed(() => Math.min(Math.round((this.existingCover() / this.recommendedCover()) * 100), 100));

  onNumberInput(setter: (v: number) => void, event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    setter(isNaN(value) ? 0 : value);
  }
}
