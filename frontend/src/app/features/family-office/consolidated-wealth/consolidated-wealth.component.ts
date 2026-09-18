import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FamilyOfficeService } from '../family-office.service';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';

@Component({
  selector: 'app-consolidated-wealth',
  standalone: true,
  imports: [CommonModule, RouterLink, InrCompactPipe],
  templateUrl: './consolidated-wealth.component.html',
})
export class ConsolidatedWealthComponent {
  readonly familyOffice = inject(FamilyOfficeService);
  readonly portfolio = inject(PortfolioService);

  readonly members = this.familyOffice.members;
  readonly assetAllocation = this.portfolio.assetAllocation;
  readonly cashEquivalent = computed(() => this.familyOffice.totalFamilyAum() * 0.04);

  readonly ledgerSummary = computed(() => {
    const txns = this.familyOffice.taggedTransactions();
    const deposits = txns
      .filter((t) => ['Purchase', 'SIP', 'Gold Purchase', 'Gold SIP'].includes(t.type) && t.status === 'Completed')
      .reduce((sum, t) => sum + t.amount, 0);
    const withdrawals = txns
      .filter((t) => ['Redemption', 'Gold Sell'].includes(t.type) && t.status === 'Completed')
      .reduce((sum, t) => sum + t.amount, 0);
    const realizedGain = Math.round(withdrawals * 0.13);
    return { deposits, withdrawals, realizedGain, netCashFlow: deposits - withdrawals };
  });

  allocationAmount(pct: number): number {
    return (this.portfolio.currentValue() * pct) / 100;
  }
}
