import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { FIXED_INCOME_INSTRUMENTS } from '../fixed-income/fixed-income-data';

@Component({
  selector: 'app-fixed-income-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './fixed-income-detail.component.html',
})
export class FixedIncomeDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly id = toSignal(this.route.paramMap.pipe(map((p) => p.get('id') ?? '')), { initialValue: '' });

  readonly instrument = computed(() => FIXED_INCOME_INSTRUMENTS.find((i) => i.id === this.id()));
  readonly units = 10;

  investmentAmount(faceValue: number): number {
    return faceValue * this.units;
  }
}
