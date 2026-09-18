import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PresentationsService } from '../presentations.service';
import { ReportHeaderComponent } from '../shared/report-header.component';
import { InrCompactPipe } from '../../../../shared/pipes/inr-compact.pipe';
import { buildDonutSegments, donutGradient } from '../shared/chart-utils';
import { MfHolding } from '../presentations-data.mock';

/** Portfolio Asset Allocation — the broad Equity/Debt/Hybrid/Gold/Liquid split (as opposed to
 * the Exposure Summary's AMC/category concentration view). */
@Component({
  selector: 'app-mf-portfolio-asset-allocation',
  standalone: true,
  imports: [CommonModule, ReportHeaderComponent, InrCompactPipe],
  templateUrl: './mf-portfolio-asset-allocation.component.html',
})
export class MfPortfolioAssetAllocationComponent {
  readonly presentations = inject(PresentationsService);
  readonly segments = computed(() => buildDonutSegments(this.presentations.mfAssetAllocation()));
  readonly gradient = computed(() => donutGradient(this.segments()));

  readonly holdingsByClass = computed(() => {
    const map = new Map<string, MfHolding[]>();
    for (const h of this.presentations.mfHoldings()) {
      const list = map.get(h.assetClass) ?? [];
      list.push(h);
      map.set(h.assetClass, list);
    }
    return [...map.entries()];
  });
}
