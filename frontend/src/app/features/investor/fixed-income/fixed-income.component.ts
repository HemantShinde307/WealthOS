import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FIXED_INCOME_INSTRUMENTS } from './fixed-income-data';

@Component({
  selector: 'app-fixed-income',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './fixed-income.component.html',
})
export class FixedIncomeComponent {
  readonly instruments = FIXED_INCOME_INSTRUMENTS;
}
