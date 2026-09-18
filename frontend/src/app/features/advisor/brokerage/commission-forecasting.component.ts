import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';
import { AMC_SLAB_PROGRESS, FORECAST_BREAKDOWN, FORECAST_QUARTERS } from '../advisor-mock-data';

@Component({
  selector: 'app-commission-forecasting',
  standalone: true,
  imports: [CommonModule, RouterLink, InrCompactPipe],
  templateUrl: './commission-forecasting.component.html',
})
export class CommissionForecastingComponent {
  readonly quarters = FORECAST_QUARTERS;
  readonly amcProgress = AMC_SLAB_PROGRESS;
  readonly breakdown = FORECAST_BREAKDOWN;

  readonly totalGross = this.breakdown.reduce((s, r) => s + r.grossTrail, 0);
  readonly totalGst = this.breakdown.reduce((s, r) => s + r.gst, 0);
  readonly totalNet = this.breakdown.reduce((s, r) => s + r.netPayout, 0);
}
