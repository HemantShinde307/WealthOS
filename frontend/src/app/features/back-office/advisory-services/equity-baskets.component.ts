import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportButtonComponent } from '../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../shared/utils/confirm';
import { AdvisoryServicesService } from './advisory-services.service';
import { ADVISORY_CUSTOMERS, EquityBasket, BasketOrder } from './advisory-services-data.mock';

@Component({
  selector: 'app-equity-baskets',
  standalone: true,
  imports: [CommonModule, ExportButtonComponent],
  templateUrl: './equity-baskets.component.html',
})
export class EquityBasketsComponent {
  readonly svc = inject(AdvisoryServicesService);
  readonly customers = ADVISORY_CUSTOMERS;

  readonly investingBasket = signal<EquityBasket | null>(null);
  readonly investCustomer = signal(ADVISORY_CUSTOMERS[0].name);
  readonly investAmount = signal<number>(25000);
  readonly lastOrderMessage = signal<string | null>(null);

  openInvest(basket: EquityBasket): void {
    this.investingBasket.set(basket);
    this.investAmount.set(basket.minInvestment);
    this.investCustomer.set(this.customers[0].name);
    this.lastOrderMessage.set(null);
  }

  closeInvest(): void {
    this.investingBasket.set(null);
  }

  confirmInvest(): void {
    const basket = this.investingBasket();
    if (!basket || this.investAmount() < basket.minInvestment) return;
    this.svc.investInBasket(basket.name, this.investCustomer(), this.investAmount());
    this.lastOrderMessage.set(`Order placed: ${this.investCustomer()} invested ₹${this.investAmount().toLocaleString('en-IN')} in ${basket.name}.`);
    this.investingBasket.set(null);
  }

  readonly exportHeaders = ['Order', 'Basket', 'Customer', 'Amount', 'Invested On', 'Status'];
  readonly exportRows = computed(() => this.svc.basketOrders().map((x) => [x.id, x.basketName, x.customerName, x.amount, x.investedOn, x.status]));

  readonly editingId = signal<string | null>(null);
  readonly eCustomerName = signal<string>('');
  readonly eAmount = signal<number>(0);
  readonly eStatus = signal<BasketOrder['status']>('Order Placed');
  readonly editError = signal<string | null>(null);
  readonly statusOptions: BasketOrder['status'][] = ['Order Placed', 'Executed'];

  edit(x: BasketOrder): void {
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
    this.svc.updateBasketOrder(id, { customerName: this.eCustomerName().trim(), amount: this.eAmount(), status: this.eStatus() });
    this.editingId.set(null);
  }

  remove(x: BasketOrder): void {
    if (!confirmDelete(`basket order ${x.id} for ${x.customerName}`)) return;
    this.svc.deleteBasketOrder(x.id);
    if (this.editingId() === x.id) this.editingId.set(null);
  }
}
