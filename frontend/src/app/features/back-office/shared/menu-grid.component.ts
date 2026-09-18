import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BackOfficeMenuColumn } from '../back-office-data.mock';

@Component({
  selector: 'app-back-office-menu-grid',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './menu-grid.component.html',
})
export class MenuGridComponent {
  @Input({ required: true }) title = '';
  @Input({ required: true }) columns: BackOfficeMenuColumn[] = [];
}
