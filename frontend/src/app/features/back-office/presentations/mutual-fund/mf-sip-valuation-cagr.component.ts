import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PresentationsService } from '../presentations.service';
import { ReportHeaderComponent } from '../shared/report-header.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { InrCompactPipe } from '../../../../shared/pipes/inr-compact.pipe';
import { cagr, downloadCsv, yearsBetween } from '../shared/chart-utils';

/** Backs both "SIP Valuation (CAGR Report)" and its "(Beta)" variant. For every active SIP,
 * computes total invested (installments-paid × amount), current value and annualised CAGR. */
@Component({
  selector: 'app-mf-sip-valuation-cagr',
  standalone: true,
  imports: [CommonModule, ReportHeaderComponent, StatCardComponent, InrCompactPipe],
  templateUrl: './mf-sip-valuation-cagr.component.html',
})
export class MfSipValuationCagrComponent {
  readonly presentations = inject(PresentationsService);
  readonly isBeta = inject(ActivatedRoute).snapshot.data['beta'] === true;

  readonly rows = computed(() =>
    this.presentations
      .mfSystematicPlans()
      .filter((p) => p.planType === 'SIP')
      .map((p) => {
        const holding = this.presentations.mfHoldings().find((h) => h.folioNo === p.folioNo);
        const invested = p.installmentsPaid * p.amount;
        const current = holding ? holding.units * holding.currentNav : invested;
        const years = yearsBetween(p.startDate);
        return { ...p, invested, current, years, cagrPct: cagr(invested, current, years) };
      }),
  );

  readonly totalInvested = computed(() => this.rows().reduce((s, r) => s + r.invested, 0));
  readonly totalCurrent = computed(() => this.rows().reduce((s, r) => s + r.current, 0));
  readonly blendedCagr = computed(() => cagr(this.totalInvested(), this.totalCurrent(), Math.max(...this.rows().map((r) => r.years), 1)));

  exportCsv(): void {
    const customer = this.presentations.selectedCustomer();
    downloadCsv(
      `MF-SIP-Valuation-CAGR${this.isBeta ? '-Beta' : ''}-${customer.name.replace(/\s+/g, '-')}.csv`,
      ['Scheme', 'Folio No', 'SIP Amount', 'Installments Paid', 'Invested Value', 'Current Value', 'CAGR %'],
      this.rows().map((r) => [r.schemeName, r.folioNo, r.amount, r.installmentsPaid, r.invested.toFixed(2), r.current.toFixed(2), r.cagrPct]),
    );
  }
}
