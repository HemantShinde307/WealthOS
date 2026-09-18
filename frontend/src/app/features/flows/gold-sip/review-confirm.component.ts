import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GoldSipStateService } from './gold-sip-state.service';

let nextPlanId = 3;

@Component({
  selector: 'app-gold-sip-review-confirm',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './review-confirm.component.html',
})
export class ReviewConfirmComponent {
  readonly state = inject(GoldSipStateService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly submitted = signal(false);

  confirm(): void {
    this.submitting.set(true);
    const planId = 'GS-' + String(nextPlanId++).padStart(2, '0');
    setTimeout(() => {
      this.state.lastPlanId.set(planId);
      this.submitting.set(false);
      this.submitted.set(true);
    }, 400);
  }

  goToGoldSipPortfolio(): void {
    this.state.reset();
    this.router.navigate(['/investor/gold-sip']);
  }
}
