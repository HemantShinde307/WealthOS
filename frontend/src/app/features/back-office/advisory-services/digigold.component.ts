import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdvisoryServicesService } from './advisory-services.service';
import { ADVISORY_CUSTOMERS, DigiGoldTxnStatus, DigiGoldTxnType } from './advisory-services-data.mock';

@Component({
  selector: 'app-digigold',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './digigold.component.html',
})
export class DigigoldComponent {
  readonly svc = inject(AdvisoryServicesService);
  readonly customers = ADVISORY_CUSTOMERS;

  readonly typeFilter = signal<'All' | DigiGoldTxnType>('All');
  readonly statusFilter = signal<'All' | DigiGoldTxnStatus>('All');
  readonly search = signal('');

  readonly flowCustomer = signal(ADVISORY_CUSTOMERS[0].name);
  readonly flowAmount = signal<number>(5000);
  readonly lastActionMessage = signal<string | null>(null);

  readonly computedGrams = computed(() => (this.flowAmount() > 0 ? this.flowAmount() / this.svc.currentGoldRate : 0));

  readonly filtered = computed(() => {
    const type = this.typeFilter();
    const status = this.statusFilter();
    const q = this.search().trim().toLowerCase();
    return this.svc.digiGoldTransactions().filter(
      (t) => (type === 'All' || t.type === type) && (status === 'All' || t.status === status) && (!q || t.customerName.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)),
    );
  });

  readonly totalBuyAmount = computed(() => this.svc.digiGoldTransactions().filter((t) => t.type === 'Buy' && t.status === 'Completed').reduce((sum, t) => sum + t.amount, 0));
  readonly totalSellAmount = computed(() => this.svc.digiGoldTransactions().filter((t) => t.type === 'Sell' && t.status === 'Completed').reduce((sum, t) => sum + t.amount, 0));

  execute(type: DigiGoldTxnType): void {
    if (this.flowAmount() <= 0) return;
    const txn = this.svc.recordDigiGoldTransaction(this.flowCustomer(), type, this.flowAmount());
    this.lastActionMessage.set(`${type === 'Buy' ? 'Purchased' : 'Sold'} ${txn.grams.toFixed(3)} g of digital gold for ${this.flowCustomer()} at ₹${txn.ratePerGram}/g.`);
  }
}
