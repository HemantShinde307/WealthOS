import { Injectable, computed, signal } from '@angular/core';
import { FixedDeposit, MOCK_FIXED_DEPOSITS, MOCK_IDLE_CASH } from '../mock-data/fixed-deposits.mock';

@Injectable({ providedIn: 'root' })
export class FixedDepositService {
  private readonly _deposits = signal<FixedDeposit[]>(MOCK_FIXED_DEPOSITS);
  readonly deposits = this._deposits.asReadonly();
  readonly idleCash = signal(MOCK_IDLE_CASH);

  readonly totalPrincipal = computed(() => this._deposits().reduce((sum, d) => sum + d.principal, 0));
  readonly totalMaturityValue = computed(() => this._deposits().reduce((sum, d) => sum + d.maturityValue, 0));

  /**
   * Today's accrued value of an FD — NOT the same as its maturity value. For a cumulative FD
   * years from maturity, interest hasn't fully accrued yet, so using the maturity figure would
   * overstate net worth today. Non-cumulative FDs pay interest out periodically rather than
   * compounding it into the corpus, so their balance stays at principal until maturity.
   */
  currentValue(deposit: FixedDeposit): number {
    if (deposit.payoutType !== 'Cumulative') return deposit.principal;
    const start = new Date(deposit.startDate).getTime();
    const maturity = new Date(deposit.maturityDate).getTime();
    const elapsedFraction = Math.min(Math.max((Date.now() - start) / (maturity - start), 0), 1);
    return Math.round(deposit.principal + (deposit.maturityValue - deposit.principal) * elapsedFraction);
  }

  readonly totalCurrentValue = computed(() => this._deposits().reduce((sum, d) => sum + this.currentValue(d), 0));

  daysToMaturity(deposit: FixedDeposit): number {
    const diff = new Date(deposit.maturityDate).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  readonly maturingSoon = computed(() => this._deposits().filter((d) => this.daysToMaturity(d) <= 30 && this.daysToMaturity(d) >= 0));
}
