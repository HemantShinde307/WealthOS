import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../../core/services/transaction.service';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';
import { AURUM_GOLD_RATE_PER_GRAM, AURUM_MONTHLY_TREND, AURUM_SUMMARY } from './aurum-data.mock';

@Component({
  selector: 'app-aurum',
  standalone: true,
  imports: [CommonModule, InrCompactPipe],
  templateUrl: './aurum.component.html',
})
export class AurumComponent {
  private readonly transactionService = inject(TransactionService);

  readonly goldRate = AURUM_GOLD_RATE_PER_GRAM;
  readonly summary = AURUM_SUMMARY;
  readonly totalGoldAumValue = computed(() => this.summary.totalGoldAumGrams * this.goldRate);

  readonly trend = AURUM_MONTHLY_TREND;
  readonly maxTrend = Math.max(...this.trend.map((t) => t.aumGrams));

  readonly goldTransactions = computed(() =>
    this.transactionService
      .transactions()
      .filter((t) => t.type.startsWith('Gold'))
      .slice(0, 8),
  );
}
