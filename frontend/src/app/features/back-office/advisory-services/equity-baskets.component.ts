import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdvisoryServicesService } from './advisory-services.service';
import { ADVISORY_CUSTOMERS, EquityBasket } from './advisory-services-data.mock';

@Component({
  selector: 'app-equity-baskets',
  standalone: true,
  imports: [CommonModule],
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
}
