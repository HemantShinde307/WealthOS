import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NriDataService } from '../nri-data.service';

const SURCHARGE_RATE = 0.15;
const CESS_RATE = 0.04;

@Component({
  selector: 'app-nri-taxation-repatriation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './taxation-repatriation.component.html',
})
export class TaxationRepatriationComponent {
  readonly nri = inject(NriDataService);

  readonly selectedClientId = signal<string | undefined>(undefined);
  readonly countryOverride = signal<string | null>(null);
  readonly repatriationAmount = signal(15000000);
  readonly assetClassIndex = signal(0);

  readonly selectedView = computed(() => {
    const views = this.nri.views();
    const id = this.selectedClientId() ?? views[0]?.client.id;
    return views.find((v) => v.client.id === id);
  });

  readonly effectiveCountry = computed(() => this.countryOverride() ?? this.selectedView()?.profile.countryOfResidence ?? '');

  readonly treaty = computed(() => this.nri.dtaaTreaties.find((t) => t.country === this.effectiveCountry()));

  readonly assetClass = computed(() => this.nri.assetClasses[this.assetClassIndex()]);

  readonly dtaaRate = computed(() => {
    const treaty = this.treaty();
    if (!treaty) return this.assetClass().standardRate;
    return this.assetClass().kind === 'interest' ? treaty.interestRate : treaty.capitalGainsRate;
  });

  readonly calc = computed(() => {
    const amount = this.repatriationAmount();
    const standardRate = this.assetClass().standardRate;
    const baseTax = (amount * standardRate) / 100;
    const surcharge = baseTax * SURCHARGE_RATE;
    const cess = baseTax * CESS_RATE;
    const effectiveStandardTax = baseTax + surcharge + cess;
    const effectiveStandardRatePct = amount > 0 ? (effectiveStandardTax / amount) * 100 : 0;
    const dtaaTax = (amount * this.dtaaRate()) / 100;
    const refund = Math.max(0, effectiveStandardTax - dtaaTax);
    return { baseTax, surcharge, cess, effectiveStandardTax, effectiveStandardRatePct, dtaaTax, refund };
  });

  selectClient(clientId: string): void {
    this.selectedClientId.set(clientId);
    this.countryOverride.set(null);
  }

  onCountryChange(event: Event): void {
    this.countryOverride.set((event.target as HTMLSelectElement).value);
  }

  onAssetClassChange(event: Event): void {
    this.assetClassIndex.set(Number((event.target as HTMLSelectElement).value));
  }

  onAmountChange(event: Event): void {
    const raw = (event.target as HTMLInputElement).value.replace(/[^0-9]/g, '');
    this.repatriationAmount.set(raw ? Number(raw) : 0);
  }
}
