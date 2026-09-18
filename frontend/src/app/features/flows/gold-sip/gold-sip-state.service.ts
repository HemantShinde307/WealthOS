import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GoldSipStateService {
  readonly planName = signal('Monthly Gold Builder');
  readonly frequency = signal<'Weekly' | 'Monthly'>('Monthly');
  readonly amount = signal(2500);
  readonly lastPlanId = signal<string | null>(null);

  reset(): void {
    this.planName.set('Monthly Gold Builder');
    this.frequency.set('Monthly');
    this.amount.set(2500);
  }
}
