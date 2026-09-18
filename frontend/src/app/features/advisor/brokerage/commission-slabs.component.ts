import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AMC_SLAB_PROGRESS, DEBT_SLABS, EQUITY_SLABS, GOLD_FLAT_RATE } from '../advisor-mock-data';

@Component({
  selector: 'app-commission-slabs',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './commission-slabs.component.html',
})
export class CommissionSlabsComponent {
  readonly equitySlabs = EQUITY_SLABS;
  readonly debtSlabs = DEBT_SLABS;
  readonly goldFlatRate = GOLD_FLAT_RATE;
  readonly amcProgress = AMC_SLAB_PROGRESS;
}
