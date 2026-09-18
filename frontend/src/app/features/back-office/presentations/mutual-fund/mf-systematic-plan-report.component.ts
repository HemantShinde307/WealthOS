import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PresentationsService } from '../presentations.service';
import { ReportHeaderComponent } from '../shared/report-header.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { InrCompactPipe } from '../../../../shared/pipes/inr-compact.pipe';
import { downloadCsv } from '../shared/chart-utils';

/** Backs "Active SIP Report", "Active STP Report" and "Active SWP Report" — structurally
 * identical listings (folio, amount, frequency, installments, next due date, status) that only
 * differ by plan type, so one parameterised component (via route data.planType) covers all three. */
@Component({
  selector: 'app-mf-systematic-plan-report',
  standalone: true,
  imports: [CommonModule, ReportHeaderComponent, StatCardComponent, InrCompactPipe],
  templateUrl: './mf-systematic-plan-report.component.html',
})
export class MfSystematicPlanReportComponent {
  readonly presentations = inject(PresentationsService);
  readonly planType = inject(ActivatedRoute).snapshot.data['planType'] as 'SIP' | 'STP' | 'SWP';

  readonly title = { SIP: 'Active SIP Report', STP: 'Active STP Report', SWP: 'Active SWP Report' }[this.planType];
  readonly subtitle = {
    SIP: 'Every Systematic Investment Plan currently active for this customer.',
    STP: 'Every Systematic Transfer Plan moving money between schemes for this customer.',
    SWP: 'Every Systematic Withdrawal Plan currently paying out to this customer.',
  }[this.planType];

  readonly rows = computed(() => this.presentations.mfSystematicPlans().filter((p) => p.planType === this.planType));
  readonly activeCount = computed(() => this.rows().filter((r) => r.status === 'Active').length);
  readonly totalMonthlyAmount = computed(() => this.rows().filter((r) => r.status === 'Active' && r.frequency === 'Monthly').reduce((s, r) => s + r.amount, 0));

  exportCsv(): void {
    const customer = this.presentations.selectedCustomer();
    downloadCsv(
      `MF-Active-${this.planType}-Report-${customer.name.replace(/\s+/g, '-')}.csv`,
      ['Scheme', 'Folio No', 'Target Scheme', 'Amount', 'Frequency', 'Installments Done', 'Next Due Date', 'Status'],
      this.rows().map((r) => [r.schemeName, r.folioNo, r.targetSchemeName ?? '', r.amount, r.frequency, r.installmentsPaid, r.nextDueDate, r.status]),
    );
  }
}
