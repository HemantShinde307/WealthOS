import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdvisoryServicesService } from './advisory-services.service';
import { SchemeCategory } from './advisory-services-data.mock';

@Component({
  selector: 'app-lt-redemption-available',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lt-redemption-available.component.html',
})
export class LtRedemptionAvailableComponent {
  readonly svc = inject(AdvisoryServicesService);

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
