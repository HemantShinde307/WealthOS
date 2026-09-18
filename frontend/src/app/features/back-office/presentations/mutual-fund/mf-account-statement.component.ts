import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { jsPDF } from 'jspdf';
import { PresentationsService } from '../presentations.service';
import { ReportHeaderComponent } from '../shared/report-header.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { InrCompactPipe } from '../../../../shared/pipes/inr-compact.pipe';

/** Account Statement — the classic MFU/RTA consolidated statement: customer + folio header,
 * a full transaction ledger for the selected date range, and closing valuation. Real PDF export
 * following the presentation-preview.component.ts jsPDF pattern. */
@Component({
  selector: 'app-mf-account-statement',
  standalone: true,
  imports: [CommonModule, ReportHeaderComponent, StatCardComponent, InrCompactPipe],
  templateUrl: './mf-account-statement.component.html',
})
export class MfAccountStatementComponent {
  readonly presentations = inject(PresentationsService);
  readonly exporting = signal(false);

  readonly transactions = computed(() =>
    this.presentations
      .mfTransactions()
      .filter((t) => t.date >= this.presentations.fromDate() && t.date <= this.presentations.toDate())
      .sort((a, b) => a.date.localeCompare(b.date)),
  );

  setFromDate(value: string): void {
    this.presentations.setDateRange(value, this.presentations.toDate());
  }

  setToDate(value: string): void {
    this.presentations.setDateRange(this.presentations.fromDate(), value);
  }

  exportPdf(): void {
    this.exporting.set(true);
    try {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 18;
      const customer = this.presentations.selectedCustomer();

      doc.setFillColor(19, 27, 46);
      doc.rect(0, 0, pageWidth, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Mutual Fund Account Statement', margin, 16);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`${customer.name} · PAN ${customer.pan}`, margin, 24);
      doc.setTextColor(0);

      let y = 42;
      doc.setFontSize(9);
      doc.text(`Statement Period: ${this.presentations.fromDate()} to ${this.presentations.toDate()}`, margin, y);
      y += 6;
      doc.text(`Relationship Manager: ${customer.rmName}`, margin, y);
      y += 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Transactions', margin, y);
      y += 7;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      const cols = [margin, margin + 22, margin + 90, margin + 115, margin + 140, margin + 165];
      ['Date', 'Scheme / Folio', 'Type', 'Amount', 'Units', 'NAV'].forEach((h, i) => doc.text(h, cols[i], y));
      y += 2;
      doc.setDrawColor(200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      for (const t of this.transactions()) {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = margin;
        }
        doc.text(t.date, cols[0], y);
        doc.text(doc.splitTextToSize(`${t.schemeName} (${t.folioNo})`, 66), cols[1], y);
        doc.text(t.type, cols[2], y);
        doc.text(t.amount.toLocaleString('en-IN'), cols[3], y);
        doc.text(t.units ? t.units.toFixed(2) : '-', cols[4], y);
        doc.text(t.nav.toFixed(2), cols[5], y);
        y += 7;
      }

      y += 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`Closing Portfolio Value: Rs. ${this.presentations.mfCurrentValue().toLocaleString('en-IN')}`, margin, y);

      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text('WealthOS Back Office · Confidential', margin, pageHeight - 10);

      doc.save(`MF-Account-Statement-${customer.name.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      this.exporting.set(false);
    }
  }
}
