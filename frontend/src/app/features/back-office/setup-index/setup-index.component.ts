import { Component } from '@angular/core';
import { MenuGridComponent } from '../shared/menu-grid.component';
import { SETUP_MENU } from '../back-office-data.mock';

@Component({
  selector: 'app-back-office-setup-index',
  standalone: true,
  imports: [MenuGridComponent],
  template: `<app-back-office-menu-grid title="Setup" [columns]="columns" />`,
})
export class SetupIndexComponent {
  readonly columns = SETUP_MENU;
}
