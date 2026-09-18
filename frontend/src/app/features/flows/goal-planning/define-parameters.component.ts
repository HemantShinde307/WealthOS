import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GoalPlanningStateService } from './goal-planning-state.service';

function defaultTargetDate(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 5);
  return d.toISOString().slice(0, 7);
}

@Component({
  selector: 'app-goal-define-parameters',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './define-parameters.component.html',
})
export class DefineParametersComponent {
  readonly state = inject(GoalPlanningStateService);
  private readonly router = inject(Router);

  readonly minDate = new Date().toISOString().slice(0, 7);

  constructor() {
    if (!this.state.targetDate()) {
      this.state.targetDate.set(defaultTargetDate());
    }
  }

  readonly isValid = computed(() => {
    return !!this.state.goalName().trim() && this.state.targetAmount() > 0 && !!this.state.targetDate() && this.state.currentSavings() >= 0;
  });

  onGoalNameInput(event: Event): void {
    this.state.goalName.set((event.target as HTMLInputElement).value);
  }

  onTargetAmountInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.state.targetAmount.set(isNaN(value) ? 0 : value);
  }

  onTargetDateInput(event: Event): void {
    this.state.targetDate.set((event.target as HTMLInputElement).value);
  }

  onCurrentSavingsInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.state.currentSavings.set(isNaN(value) ? 0 : value);
  }

  continue(): void {
    this.router.navigate(['/goal-planning/investment-strategy']);
  }
}
