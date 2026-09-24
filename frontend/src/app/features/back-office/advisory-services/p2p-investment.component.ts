import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportButtonComponent } from '../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../shared/utils/confirm';
import { AdvisoryServicesService } from './advisory-services.service';
import { ADVISORY_CUSTOMERS, P2pOption, P2pOrder } from './advisory-services-data.mock';

@Component({
  selector: 'app-p2p-investment',
  standalone: true,
  imports: [CommonModule, ExportButtonComponent],
  templateUrl: './p2p-investment.component.html',
})
export class P2pInvestmentComponent {
  readonly svc = inject(AdvisoryServicesService);
  readonly customers = ADVISORY_CUSTOMERS;

  readonly investingOption = signal<P2pOption | null>(null);
  readonly investCustomer = signal(ADVISORY_CUSTOMERS[0].name);
  readonly investAmount = signal<number>(5000);
  readonly lastOrderMessage = signal<string | null>(null);

  openInvest(option: P2pOption): void {
    this.investingOption.set(option);
    this.investAmount.set(option.minInvestment);
    this.investCustomer.set(this.customers[0].name);
    this.lastOrderMessage.set(null);
  }

  closeInvest(): void {
    this.investingOption.set(null);
  }

  confirmInvest(): void {
    const option = this.investingOption();
    if (!option || this.investAmount() < option.minInvestment) return;
    this.svc.investInP2p(option.planName, this.investCustomer(), this.investAmount());
    this.lastOrderMessage.set(`Order placed: ${this.investCustomer()} invested ₹${this.investAmount().toLocaleString('en-IN')} in ${option.planName}.`);
    this.investingOption.set(null);
  }

  readonly exportHeaders = ['Order', 'Plan', 'Customer', 'Amount', 'Invested On', 'Status'];
  readonly exportRows = computed(() => this.svc.p2pOrders().map((x) => [x.id, x.planName, x.customerName, x.amount, x.investedOn, x.status]));

  readonly editingId = signal<string | null>(null);
  readonly eCustomerName = signal<string>('');
  readonly eAmount = signal<number>(0);
  readonly eStatus = signal<P2pOrder['status']>('Order Placed');
  readonly editError = signal<string | null>(null);
  readonly statusOptions: P2pOrder['status'][] = ['Order Placed', 'Executed'];

  edit(x: P2pOrder): void {
    this.editingId.set(x.id);
    this.eCustomerName.set(x.customerName);
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
    this.svc.updateP2pOrder(id, { customerName: this.eCustomerName().trim(), amount: this.eAmount(), status: this.eStatus() });
    this.editingId.set(null);
  }

  remove(x: P2pOrder): void {
    if (!confirmDelete(`P2P order ${x.id} for ${x.customerName}`)) return;
    this.svc.deleteP2pOrder(x.id);
    if (this.editingId() === x.id) this.editingId.set(null);
  }
}
