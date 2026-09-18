import { Component } from '@angular/core';
import { MenuGridComponent } from '../shared/menu-grid.component';
import { REPORTS_ADVISORY_MENU } from '../back-office-data.mock';

@Component({
  selector: 'app-back-office-reports-advisory-index',
  standalone: true,
  imports: [MenuGridComponent],
  template: `<app-back-office-menu-grid title="Reports & Advisory" [columns]="columns" />`,
})
export class ReportsAdvisoryIndexComponent {
  readonly columns = REPORTS_ADVISORY_MENU;
}
