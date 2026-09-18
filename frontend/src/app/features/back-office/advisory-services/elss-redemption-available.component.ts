import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdvisoryServicesService } from './advisory-services.service';

@Component({
  selector: 'app-elss-redemption-available',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './elss-redemption-available.component.html',
})
export class ElssRedemptionAvailableComponent {
  readonly svc = inject(AdvisoryServicesService);

  readonly search = signal('');
  readonly hideActioned = signal(false);

  readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const hideActioned = this.hideActioned();
    return this.svc.elssRedemptionList().filter((h) => {
      if (hideActioned && h.actioned) return false;
      if (q && !h.customerName.toLowerCase().includes(q) && !h.schemeName.toLowerCase().includes(q) && !h.folioNo.includes(q)) return false;
      return true;
    });
  });

  readonly totalUnitsAvailable = computed(() => this.filtered().reduce((sum, h) => sum + h.units, 0));
  readonly totalRedeemableValue = computed(() => this.filtered().reduce((sum, h) => sum + h.currentValue, 0));

  markActioned(id: string): void {
    this.svc.markHoldingActioned(id);
  }
}
