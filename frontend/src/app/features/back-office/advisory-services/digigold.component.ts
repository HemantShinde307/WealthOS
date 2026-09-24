import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportButtonComponent } from '../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../shared/utils/confirm';
import { AdvisoryServicesService } from './advisory-services.service';
import { ADVISORY_CUSTOMERS, DigiGoldTxnStatus, DigiGoldTxnType, DigiGoldTransaction } from './advisory-services-data.mock';

@Component({
  selector: 'app-digigold',
  standalone: true,
  imports: [CommonModule, ExportButtonComponent],
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

  readonly exportHeaders = ['Txn ID', 'Customer', 'Type', 'Grams', 'Rate/g', 'Amount', 'Vendor', 'Timestamp', 'Status'];
  readonly exportRows = computed(() => this.filtered().map((x) => [x.id, x.customerName, x.type, x.grams, x.ratePerGram, x.amount, x.vendor, x.timestamp, x.status]));

  readonly editingId = signal<string | null>(null);
  readonly eCustomerName = signal<string>('');
  readonly eType = signal<DigiGoldTxnType>('Buy');
  readonly eGrams = signal<number>(0);
  readonly eAmount = signal<number>(0);
  readonly eStatus = signal<DigiGoldTxnStatus>('Completed');
  readonly editError = signal<string | null>(null);
  readonly typeOptions: DigiGoldTxnType[] = ['Buy', 'Sell'];
  readonly editStatusOptions: DigiGoldTxnStatus[] = ['Completed', 'Pending', 'Failed'];

  edit(x: DigiGoldTransaction): void {
    this.editingId.set(x.id);
    this.eCustomerName.set(x.customerName);
    this.eType.set(x.type);
    this.eGrams.set(x.grams);
    this.eAmount.set(x.amount);
    this.eStatus.set(x.status);
    this.editError.set(null);
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  saveEdit(): void {
    const id = this.editingId();
    if (!id) return;
    if (!this.eCustomerName().trim()) {
      this.editError.set('Please fill in all required fields.');
      return;
    }
    this.svc.updateDigiGoldTransaction(id, { customerName: this.eCustomerName().trim(), type: this.eType(), grams: this.eGrams(), amount: this.eAmount(), status: this.eStatus() });
    this.editingId.set(null);
  }

  remove(x: DigiGoldTransaction): void {
    if (!confirmDelete(`DigiGold transaction ${x.id} for ${x.customerName}`)) return;
    this.svc.deleteDigiGoldTransaction(x.id);
    if (this.editingId() === x.id) this.editingId.set(null);
  }
}
