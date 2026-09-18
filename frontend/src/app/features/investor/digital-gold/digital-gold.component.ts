import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';

@Component({
  selector: 'app-digital-gold',
  standalone: true,
  imports: [CommonModule, RouterLink, InrCompactPipe],
  templateUrl: './digital-gold.component.html',
})
export class DigitalGoldComponent {
  readonly currentRate = 7842;
  readonly holdingsGrams = 24.685;
  readonly investedValue = 165000;
  readonly currentValue = this.holdingsGrams * this.currentRate;

  readonly recentActivity = [
    { type: 'Purchase', grams: 3.2, amount: 25000, date: '2026-09-01' },
    { type: 'SIP', grams: 0.64, amount: 5000, date: '2026-08-30' },
    { type: 'Sell', grams: -5.1, amount: -40000, date: '2026-08-27' },
  ];
}
