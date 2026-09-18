import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';

interface GoldSipPlan {
  id: string;
  name: string;
  frequency: 'Weekly' | 'Monthly';
  amount: number;
  gramsAccumulated: number;
  nextDebit: string;
  status: 'Active' | 'Paused';
}

@Component({
  selector: 'app-gold-sip',
  standalone: true,
  imports: [CommonModule, RouterLink, InrCompactPipe],
  templateUrl: './gold-sip.component.html',
})
export class GoldSipComponent {
  readonly plans: GoldSipPlan[] = [
    { id: 'GS-01', name: 'Monthly Gold Builder', frequency: 'Monthly', amount: 5000, gramsAccumulated: 8.42, nextDebit: '2026-10-01', status: 'Active' },
    { id: 'GS-02', name: 'Wedding Gold Fund', frequency: 'Weekly', amount: 1000, gramsAccumulated: 3.15, nextDebit: '2026-09-14', status: 'Active' },
  ];
}
