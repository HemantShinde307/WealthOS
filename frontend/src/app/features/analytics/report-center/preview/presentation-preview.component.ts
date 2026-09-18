import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { jsPDF } from 'jspdf';
import { PortfolioService } from '../../../../core/services/portfolio.service';
import { InrCompactPipe } from '../../../../shared/pipes/inr-compact.pipe';
import { PRESENTATION_PAGES } from '../../analytics-data.mock';

@Component({
  selector: 'app-presentation-preview',
  standalone: true,
  imports: [CommonModule, RouterLink, InrCompactPipe],
  templateUrl: './presentation-preview.component.html',
})
export class PresentationPreviewComponent {
  readonly portfolio = inject(PortfolioService);

  readonly pages = PRESENTATION_PAGES;
  readonly currentPageIndex = signal(0);
  readonly viewMode = signal<'Editor' | 'Client'>('Client');

  readonly currentPage = computed(() => this.pages[this.currentPageIndex()]);

  readonly chartPath = this.buildPath(this.portfolio.growthSeries.map((p) => p.value));
  readonly benchmarkPath = this.buildPath(this.portfolio.growthSeries.map((p) => p.benchmark ?? 0));

  readonly netCashFlow = 125_000;
  readonly alphaGenerated = 1.8;

  readonly exporting = signal(false);

  exportPdf(): void {
    this.exporting.set(true);
    try {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;

      this.pages.forEach((page, i) => {
        if (i > 0) doc.addPage();
        this.renderPdfPage(doc, page.title, pageWidth, pageHeight, margin);
      });

      const fileName = `Portfolio-Performance-Report-${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(fileName);
    } finally {
      this.exporting.set(false);
    }
  }

  private renderPdfPage(doc: jsPDF, title: string, pageWidth: number, pageHeight: number, margin: number): void {
    switch (title) {
      case 'Cover': {
        doc.setFillColor(30, 64, 175);
        doc.rect(margin, 60, 30, 4, 'F');
        doc.setFontSize(26);
        doc.setFont('helvetica', 'bold');
        doc.text('Q3 Portfolio Performance', margin, 90);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Prepared for: The Malhotra Family Trust', margin, 105);
        doc.setFontSize(10);
        doc.setTextColor(120);
        doc.text(new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }), margin, 113);
        doc.setTextColor(0);
        break;
      }
      case 'Executive Summary': {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Executive Summary', margin, margin);
        const cards: [string, string][] = [
          ['Total Portfolio Value', this.formatInr(this.portfolio.currentValue())],
          ['Net Cash Flow', `Rs. ${this.netCashFlow.toLocaleString('en-IN')}`],
          ['Alpha Generated', `+${this.alphaGenerated}%`],
        ];
        let y = margin + 15;
        cards.forEach(([label, value]) => {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(110);
          doc.text(label.toUpperCase(), margin, y);
          doc.setFontSize(15);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(0);
          doc.text(value, margin, y + 8);
          y += 18;
        });
        break;
      }
      case 'Performance': {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Cumulative Growth vs Benchmark', margin, margin);
        const series = this.portfolio.growthSeries;
        const chartX = margin;
        const chartY = margin + 15;
        const chartW = pageWidth - margin * 2;
        const chartH = 90;
        const values = series.map((p) => p.value);
        const benchmarks = series.map((p) => p.benchmark ?? 0);
        const max = Math.max(...values, ...benchmarks);
        const min = Math.min(...values, ...benchmarks);
        const range = max - min || 1;
        const toPoint = (v: number, idx: number): [number, number] => [
          chartX + (idx / (series.length - 1 || 1)) * chartW,
          chartY + chartH - ((v - min) / range) * chartH,
        ];
        doc.setDrawColor(180);
        doc.line(chartX, chartY + chartH, chartX + chartW, chartY + chartH);
        doc.line(chartX, chartY, chartX, chartY + chartH);
        doc.setDrawColor(30, 64, 175);
        doc.setLineWidth(0.6);
        for (let i = 1; i < series.length; i++) {
          const [x1, y1] = toPoint(values[i - 1], i - 1);
          const [x2, y2] = toPoint(values[i], i);
          doc.line(x1, y1, x2, y2);
        }
        doc.setDrawColor(160);
        doc.setLineWidth(0.4);
        for (let i = 1; i < series.length; i++) {
          const [x1, y1] = toPoint(benchmarks[i - 1], i - 1);
          const [x2, y2] = toPoint(benchmarks[i], i);
          doc.line(x1, y1, x2, y2);
        }
        doc.setFontSize(7);
        doc.setTextColor(110);
        series.forEach((p, i) => {
          const [x] = toPoint(0, i);
          doc.text(p.date, x, chartY + chartH + 6, { align: 'center' });
        });
        doc.setTextColor(0);
        break;
      }
      case 'Asset Allocation': {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Asset Allocation', margin, margin);
        const segments = this.portfolio.assetAllocation();
        let y = margin + 18;
        if (segments.length === 0) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(110);
          doc.text('No holdings tracked yet for this portfolio.', margin, y);
          doc.setTextColor(0);
        } else {
          const barWidth = pageWidth - margin * 2;
          segments.forEach((seg) => {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(seg.label, margin, y);
            doc.text(`${seg.pct}%`, margin + barWidth, y, { align: 'right' });
            doc.setFillColor(230, 230, 230);
            doc.rect(margin, y + 2, barWidth, 3, 'F');
            doc.setFillColor(30, 64, 175);
            doc.rect(margin, y + 2, (barWidth * seg.pct) / 100, 3, 'F');
            y += 14;
          });
        }
        break;
      }
      case 'Attribution': {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Allocation vs. Selection Effect', margin, margin);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const text =
          'Active return for the period was driven primarily by security selection within Mid & Small Cap Equity, ' +
          'partially offset by an underweight allocation to Debt during a rate-easing cycle. See the full Performance ' +
          'Attribution module for the detailed breakdown.';
        doc.text(doc.splitTextToSize(text, pageWidth - margin * 2), margin, margin + 15);
        break;
      }
      case 'Risk Disclosure': {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Risk Disclosure', margin, margin);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(110);
        const paragraphs = [
          'Mutual fund investments are subject to market risks. Please read all scheme related documents carefully before investing.',
          'Past performance is not indicative of future returns. The figures shown are illustrative and computed using internal analytics models as of the report date.',
          'This document is confidential and prepared exclusively for the named recipient. It may not be redistributed without written consent.',
        ];
        let y = margin + 15;
        paragraphs.forEach((p) => {
          const lines = doc.splitTextToSize(p, pageWidth - margin * 2);
          doc.text(lines, margin, y);
          y += lines.length * 5 + 4;
        });
        doc.setTextColor(0);
        break;
      }
    }

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('WealthOS Advisory · Confidential', margin, pageHeight - 10);
    doc.setTextColor(0);
  }

  private formatInr(value: number): string {
    if (value >= 10_000_000) return `Rs. ${(value / 10_000_000).toFixed(2)} Cr`;
    if (value >= 100_000) return `Rs. ${(value / 100_000).toFixed(2)} L`;
    return `Rs. ${value.toLocaleString('en-IN')}`;
  }

  goToPage(index: number): void {
    this.currentPageIndex.set(index);
  }

  nextPage(): void {
    this.currentPageIndex.update((i) => Math.min(i + 1, this.pages.length - 1));
  }

  prevPage(): void {
    this.currentPageIndex.update((i) => Math.max(i - 1, 0));
  }

  setViewMode(mode: 'Editor' | 'Client'): void {
    this.viewMode.set(mode);
  }

  private buildPath(values: number[]): string {
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const points = values.map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = 100 - ((v - min) / range) * 90 - 5;
      return `${x},${y.toFixed(1)}`;
    });
    return `M${points.join(' L')}`;
  }
}
