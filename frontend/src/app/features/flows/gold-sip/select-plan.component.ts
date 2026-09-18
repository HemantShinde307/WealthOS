import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GoldSipStateService } from './gold-sip-state.service';

@Component({
  selector: 'app-gold-sip-select-plan',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select-plan.component.html',
})
export class SelectPlanComponent {
  readonly state = inject(GoldSipStateService);
  private readonly router = inject(Router);

  readonly frequencies: Array<{ value: 'Weekly' | 'Monthly'; label: string; description: string; icon: string }> = [
    { value: 'Weekly', label: 'Weekly', description: 'Small, frequent debits — great for building a gold habit fast.', icon: 'calendar_view_week' },
    { value: 'Monthly', label: 'Monthly', description: 'One debit a month, aligned with your salary cycle.', icon: 'calendar_month' },
  ];

  readonly presetPlans = [
    { name: 'Monthly Gold Builder', frequency: 'Monthly' as const },
    { name: 'Wedding Gold Fund', frequency: 'Weekly' as const },
    { name: 'Festive Gold Saver', frequency: 'Monthly' as const },
  ];

  selectFrequency(value: 'Weekly' | 'Monthly'): void {
    this.state.frequency.set(value);
  }

  selectPreset(name: string, frequency: 'Weekly' | 'Monthly'): void {
    this.state.planName.set(name);
    this.state.frequency.set(frequency);
  }

  continue(): void {
    this.router.navigate(['/gold-sip/investment-details']);
  }
}
