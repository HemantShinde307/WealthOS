import { Component } from '@angular/core';
import { MenuGridComponent } from '../shared/menu-grid.component';
import { CUSTOMER_INVESTMENTS_MENU } from '../back-office-data.mock';

@Component({
  selector: 'app-back-office-customer-investments-index',
  standalone: true,
  imports: [MenuGridComponent],
  template: `<app-back-office-menu-grid title="Customer & Investments" [columns]="columns" />`,
})
export class CustomerInvestmentsIndexComponent {
  readonly columns = CUSTOMER_INVESTMENTS_MENU;
}
