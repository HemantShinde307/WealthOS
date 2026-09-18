import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdvisoryServicesService } from './advisory-services.service';
import { ADVISORY_CUSTOMERS, P2pOption } from './advisory-services-data.mock';

@Component({
  selector: 'app-p2p-investment',
  standalone: true,
  imports: [CommonModule],
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
}
