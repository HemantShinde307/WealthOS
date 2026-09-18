import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdvisoryServicesService } from './advisory-services.service';

@Component({
  selector: 'app-book-profit-stop-loss-advice',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './book-profit-stop-loss-advice.component.html',
})
export class BookProfitStopLossAdviceComponent {
  readonly svc = inject(AdvisoryServicesService);

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
