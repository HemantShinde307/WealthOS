import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { jsPDF } from 'jspdf';
import { PresentationsService } from '../presentations.service';
import { ReportHeaderComponent } from '../shared/report-header.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { InrCompactPipe } from '../../../../shared/pipes/inr-compact.pipe';
import { ExportButtonComponent } from '../../../../shared/components/export-button/export-button.component';
import { buildDonutSegments, buildLinePath, donutGradient } from '../shared/chart-utils';

@Component({
  selector: 'app-consolidated-wealth-portfolio',
  standalone: true,
  imports: [CommonModule, ReportHeaderComponent, StatCardComponent, InrCompactPipe, ExportButtonComponent],
  templateUrl: './consolidated-wealth-portfolio.component.html',
})
export class ConsolidatedWealthPortfolioComponent {
  readonly presentations = inject(PresentationsService);
  readonly exporting = signal(false);

  readonly segments = computed(() => buildDonutSegments(this.presentations.consolidatedAllocation()));
  readonly gradient = computed(() => donutGradient(this.segments()));

  // Illustrative 12-month wealth trend derived from current total wealth, for the growth chart.
  readonly trend = computed(() => {
    const current = this.presentations.totalWealth();
    const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
    const growthFactors = [0.82, 0.84, 0.86, 0.88, 0.9, 0.91, 0.93, 0.95, 0.97, 0.98, 0.99, 1];
    return months.map((date, i) => ({ date, value: current * growthFactors[i] }));
  });

  readonly trendPath = computed(() => buildLinePath(this.trend().map((p) => p.value)));

  readonly totalInvested = computed(() => this.rows().reduce((sum, r) => sum + r.invested, 0));

  readonly rows = computed(() => [
    { label: 'Mutual Funds', invested: this.presentations.mfInvestedValue(), current: this.presentations.mfCurrentValue() },
    { label: 'Direct Equity', invested: this.presentations.stockInvestedValue(), current: this.presentations.stockCurrentValue() },
    { label: 'FDs / RDs / Bonds', invested: this.presentations.fdRdInvestments().reduce((s, f) => s + (f.principal || (f.installmentAmount ?? 0) * f.tenureMonths), 0), current: this.presentations.fdRdCurrentValue() },
    { label: 'PPF', invested: this.presentations.ppfAccounts().reduce((s, p) => s + p.currentBalance, 0), current: this.presentations.ppfBalance() },
    { label: 'Bullion', invested: this.presentations.bullionInvestedValue(), current: this.presentations.bullionCurrentValue() },
  ]);

  readonly exportHeaders = ['Asset Class', 'Invested Value', 'Current Value', 'Gain / Loss'];
  readonly exportRows = computed(() => this.rows().map((r) => [r.label, r.invested, r.current, r.current - r.invested]));

  exportPdf(): void {
    this.exporting.set(true);
    try {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const customer = this.presentations.selectedCustomer();

      doc.setFillColor(19, 27, 46);
      doc.rect(0, 0, pageWidth, 32, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Consolidated Wealth Portfolio', margin, 18);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`${customer.name} · PAN ${customer.pan}`, margin, 26);
      doc.setTextColor(0);

      let y = 45;
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Total Wealth: ' + this.formatInr(this.presentations.totalWealth()), margin, y);
      y += 12;

      doc.setFontSize(11);
      doc.text('Asset-Class Break-up', margin, y);
      y += 8;
      const barWidth = pageWidth - margin * 2;
      this.segments().forEach((seg) => {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(seg.label, margin, y);
        doc.text(`${seg.pct}%`, margin + barWidth, y, { align: 'right' });
        doc.setFillColor(230, 230, 230);
        doc.rect(margin, y + 2, barWidth, 3, 'F');
        doc.setFillColor(30, 64, 175);
        doc.rect(margin, y + 2, (barWidth * seg.pct) / 100, 3, 'F');
        y += 12;
      });

      y += 6;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Invested vs. Current Value', margin, y);
      y += 8;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      this.rows().forEach((r) => {
        doc.text(r.label, margin, y);
        doc.text(this.formatInr(r.invested), margin + 70, y, { align: 'right' });
        doc.text(this.formatInr(r.current), margin + barWidth, y, { align: 'right' });
        y += 8;
      });

      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text('WealthOS Back Office · Confidential', margin, doc.internal.pageSize.getHeight() - 10);

      doc.save(`Consolidated-Wealth-Portfolio-${customer.name.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      this.exporting.set(false);
    }
  }

  private formatInr(value: number): string {
    if (value >= 1_00_00_000) return `Rs. ${(value / 1_00_00_000).toFixed(2)} Cr`;
    if (value >= 1_00_000) return `Rs. ${(value / 1_00_000).toFixed(2)} L`;
    return `Rs. ${value.toLocaleString('en-IN')}`;
  }
}
