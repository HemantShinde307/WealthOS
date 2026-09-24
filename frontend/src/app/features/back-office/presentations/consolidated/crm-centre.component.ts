import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PresentationsService } from '../presentations.service';
import { ReportHeaderComponent } from '../shared/report-header.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { ExportButtonComponent } from '../../../../shared/components/export-button/export-button.component';
import { InrCompactPipe } from '../../../../shared/pipes/inr-compact.pipe';

@Component({
  selector: 'app-crm-centre',
  standalone: true,
  imports: [CommonModule, RouterLink, ReportHeaderComponent, StatCardComponent, InrCompactPipe, ExportButtonComponent],
  templateUrl: './crm-centre.component.html',
})
export class CrmCentreComponent {
  readonly presentations = inject(PresentationsService);

  readonly exportHeaders = ['Product', 'Holdings', 'Current Value'];
  readonly exportRows = computed(() => [
    ['Mutual Funds', `${this.presentations.mfHoldings().length} folios`, this.presentations.mfCurrentValue()],
    ['Direct Equity', `${this.presentations.stockHoldings().length} scrips`, this.presentations.stockCurrentValue()],
    ['FDs / RDs / Bonds', `${this.presentations.fdRdInvestments().length} instruments`, this.presentations.fdRdCurrentValue()],
    ['PPF', `${this.presentations.ppfAccounts().length} accounts`, this.presentations.ppfBalance()],
    ['Bullion', `${this.presentations.bullionHoldings().length} holdings`, this.presentations.bullionCurrentValue()],
    ['General Insurance (sum insured)', `${this.presentations.giPolicies().length} policies`, this.presentations.giSumInsuredTotal()],
  ]);

  readonly upcomingActions = computed(() => {
    const actions: { date: string; kind: string; detail: string; icon: string }[] = [];
    for (const sip of this.presentations.mfSystematicPlans()) {
      if (sip.status !== 'Active') continue;
      actions.push({ date: sip.nextDueDate, kind: sip.planType, detail: `${sip.schemeName} · ₹${sip.amount.toLocaleString('en-IN')}`, icon: sip.planType === 'SWP' ? 'call_made' : 'call_received' });
    }
    for (const gi of this.presentations.giPolicies()) {
      actions.push({ date: gi.expiryDate, kind: 'Policy Renewal', detail: `${gi.planName} (${gi.insurer})`, icon: 'shield' });
    }
    for (const ch of this.presentations.ppfChallans()) {
      if (ch.status === 'Pending') actions.push({ date: ch.date, kind: 'PPF Challan Due', detail: `${ch.challanNo} · ₹${ch.amount.toLocaleString('en-IN')}`, icon: 'receipt_long' });
    }
    return actions.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 8);
  });

  readonly recentActivity = computed(() =>
    [
      ...this.presentations.mfTransactions().map((t) => ({ date: t.date, label: `${t.type} · ${t.schemeName}`, amount: t.amount })),
      ...this.presentations.stockTransactions().map((t) => ({ date: t.date, label: `${t.type} ${t.qty} ${t.symbol} @ ₹${t.price}`, amount: t.type === 'Buy' ? -(t.qty * t.price) : t.qty * t.price })),
    ]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 6),
  );
}
