import { Injectable, signal } from '@angular/core';
import { Goal } from '../../../core/models/domain.models';

@Injectable({ providedIn: 'root' })
export class GoalPlanningStateService {
  readonly category = signal<Goal['category'] | null>(null);
  readonly goalName = signal<string>('');
  readonly targetAmount = signal<number>(1000000);
  readonly targetDate = signal<string>('');
  readonly currentSavings = signal<number>(0);
  readonly lastGoalId = signal<string | null>(null);

  reset(): void {
    this.category.set(null);
    this.goalName.set('');
    this.targetAmount.set(1000000);
    this.targetDate.set('');
    this.currentSavings.set(0);
  }
}
