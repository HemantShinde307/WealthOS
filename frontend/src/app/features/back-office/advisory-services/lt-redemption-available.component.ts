import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportButtonComponent } from '../../../shared/components/export-button/export-button.component';
import { AdvisoryServicesService } from './advisory-services.service';
import { SchemeCategory } from './advisory-services-data.mock';

@Component({
  selector: 'app-lt-redemption-available',
  standalone: true,
  imports: [CommonModule, ExportButtonComponent],
  templateUrl: './lt-redemption-available.component.html',
})
export class LtRedemptionAvailableComponent {
  readonly svc = inject(AdvisoryServicesService);

  readonly exportHeaders = ['Customer', 'Scheme', 'AMC', 'Category', 'Folio', 'Holding (yrs)', 'Units', 'Gain %', 'Actioned'];
  readonly exportRows = computed(() => this.filtered().map((h) => [h.customerName, h.schemeName, h.amc, h.category, h.folioNo, Number(h.holdingYears.toFixed(1)), h.units, Number(h.gainPct.toFixed(1)), h.actioned ? 'Yes' : 'No']));

  readonly categoryFilter = signal<'All' | SchemeCategory>('All');
  readonly search = signal('');
  readonly hideActioned = signal(false);

  readonly filtered = computed(() => {
    const category = this.categoryFilter();
    const q = this.search().trim().toLowerCase();
    const hideActioned = this.hideActioned();
    return this.svc.ltRedemptionList().filter((h) => {
      if (category !== 'All' && h.category !== category) return false;
      if (hideActioned && h.actioned) return false;
      if (q && !h.customerName.toLowerCase().includes(q) && !h.schemeName.toLowerCase().includes(q) && !h.folioNo.includes(q)) return false;
      return true;
    });
  });

  markActioned(id: string): void {
    this.svc.markHoldingActioned(id);
  }
}
