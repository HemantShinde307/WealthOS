import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportButtonComponent } from '../../../shared/components/export-button/export-button.component';
import { AdvisoryServicesService } from './advisory-services.service';

@Component({
  selector: 'app-book-profit-stop-loss-advice',
  standalone: true,
  imports: [CommonModule, ExportButtonComponent],
  templateUrl: './book-profit-stop-loss-advice.component.html',
})
export class BookProfitStopLossAdviceComponent {
  readonly svc = inject(AdvisoryServicesService);

  readonly exportHeaders = ['Customer', 'Scheme', 'Category', 'AMC', 'Folio', 'Invested', 'Current Value', 'Gain %', 'Signal', 'Actioned'];
  readonly exportRows = computed(() => this.filtered().map((h) => [h.customerName, h.schemeName, h.category, h.amc, h.folioNo, Math.round(h.invested), Math.round(h.currentValue), Number(h.gainPct.toFixed(1)), h.signal, h.actioned ? 'Yes' : 'No']));

  readonly signalFilter = signal<'All' | 'Book Profit' | 'Stop Loss Advised'>('All');
  readonly search = signal('');
  readonly hideActioned = signal(false);

  readonly filtered = computed(() => {
    const signalF = this.signalFilter();
    const q = this.search().trim().toLowerCase();
    const hideActioned = this.hideActioned();
    return this.svc.bookProfitStopLossList().filter((h) => {
      if (signalF !== 'All' && h.signal !== signalF) return false;
      if (hideActioned && h.actioned) return false;
      if (q && !h.customerName.toLowerCase().includes(q) && !h.schemeName.toLowerCase().includes(q) && !h.folioNo.includes(q)) return false;
      return true;
    });
  });

  readonly bookProfitCount = computed(() => this.svc.bookProfitStopLossList().filter((h) => h.signal === 'Book Profit').length);
  readonly stopLossCount = computed(() => this.svc.bookProfitStopLossList().filter((h) => h.signal === 'Stop Loss Advised').length);

  markActioned(id: string): void {
    this.svc.markHoldingActioned(id);
  }
}
