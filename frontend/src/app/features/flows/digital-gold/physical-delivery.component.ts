import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DigitalGoldStateService } from './digital-gold-state.service';

interface GoldFormat {
  id: string;
  label: string;
  grams: number;
  making: number;
}

@Component({
  selector: 'app-physical-delivery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './physical-delivery.component.html',
})
export class PhysicalDeliveryComponent {
  readonly state = inject(DigitalGoldStateService);
  private readonly router = inject(Router);

  readonly formats: GoldFormat[] = [
    { id: '1g', label: '1g Coin', grams: 1, making: 350 },
    { id: '5g', label: '5g Bar', grams: 5, making: 1200 },
    { id: '10g', label: '10g Bar', grams: 10, making: 2000 },
  ];

  readonly selectedFormatId = signal('5g');
  readonly fullName = signal('');
  readonly addressLine = signal('');
  readonly city = signal('');
  readonly pincode = signal('');
  readonly submitted = signal(false);

  readonly selectedFormat = computed(() => this.formats.find((f) => f.id === this.selectedFormatId())!);
  readonly shippingCharge = 500;
  readonly totalDue = computed(() => this.selectedFormat().making + this.shippingCharge);

  readonly formValid = computed(
    () => this.selectedFormat().grams <= this.state.holdingsGrams() && this.fullName().trim().length > 0 && this.addressLine().trim().length > 0 && this.city().trim().length > 0 && this.pincode().trim().length === 6,
  );

  confirm(): void {
    if (!this.formValid()) return;
    this.state.recordDelivery(this.selectedFormat().grams, this.totalDue());
    this.submitted.set(true);
  }

  goToGoldPortfolio(): void {
    this.router.navigate(['/investor/gold']);
  }
}
