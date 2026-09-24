import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OtherInvestmentsService } from '../other-investments.service';
import { BullionHolding } from '../insurance-investments-data.mock';
import { ExportButtonComponent } from '../../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../../shared/utils/confirm';

@Component({
  selector: 'app-other-investments-bullion',
  standalone: true,
  imports: [CommonModule, ExportButtonComponent],
  templateUrl: './bullion.component.html',
})
export class BullionComponent {
  readonly svc = inject(OtherInvestmentsService);

  readonly exportHeaders = ['Customer', 'Metal', 'Form', 'Weight (g)', 'Purchase Rate', 'Current Rate', 'Purchase Date', 'Current Value'];
  readonly exportRows = computed(() =>
    this.rows().map((b) => [b.customerName, b.metal, b.form, b.weightGrams, b.purchaseRate, b.currentRate, b.purchaseDate, b.value]),
  );
  readonly metals: BullionHolding['metal'][] = ['Gold', 'Silver'];
  readonly forms: BullionHolding['form'][] = ['Coin', 'Bar', 'Jewellery', 'Digital Gold'];

  readonly editingId = signal<string | null>(null);
  readonly formVisible = signal(false);
  readonly customerName = signal('');
  readonly metal = signal<BullionHolding['metal']>('Gold');
  readonly form = signal<BullionHolding['form']>('Coin');
  readonly weightGrams = signal<number | null>(null);
  readonly purchaseRate = signal<number | null>(null);
  readonly currentRate = signal<number | null>(null);
  readonly purchaseDate = signal(new Date().toISOString().slice(0, 10));
  readonly error = signal<string | null>(null);

  readonly rows = computed(() => this.svc.bullion().map((b) => ({ ...b, value: b.weightGrams * b.currentRate })));

  openNew(): void {
    this.editingId.set(null);
    this.customerName.set('');
    this.metal.set('Gold');
    this.form.set('Coin');
    this.weightGrams.set(null);
    this.purchaseRate.set(null);
    this.currentRate.set(null);
    this.purchaseDate.set(new Date().toISOString().slice(0, 10));
    this.error.set(null);
    this.formVisible.set(true);
  }

  edit(b: BullionHolding): void {
    this.editingId.set(b.id);
    this.customerName.set(b.customerName);
    this.metal.set(b.metal);
    this.form.set(b.form);
    this.weightGrams.set(b.weightGrams);
    this.purchaseRate.set(b.purchaseRate);
    this.currentRate.set(b.currentRate);
    this.purchaseDate.set(b.purchaseDate);
    this.error.set(null);
    this.formVisible.set(true);
  }

  cancel(): void {
    this.formVisible.set(false);
  }

  save(): void {
    if (!this.customerName().trim() || !this.weightGrams() || !this.purchaseRate()) {
      this.error.set('Customer, weight and purchase rate are required.');
      return;
    }
    const payload = {
      customerName: this.customerName().trim(),
      metal: this.metal(),
      form: this.form(),
      weightGrams: this.weightGrams()!,
      purchaseRate: this.purchaseRate()!,
      currentRate: this.currentRate() ?? this.purchaseRate()!,
      purchaseDate: this.purchaseDate(),
    };
    const id = this.editingId();
    if (id) this.svc.updateBullion(id, payload);
    else this.svc.addBullion(payload);
    this.formVisible.set(false);
  }

  remove(b: BullionHolding): void {
    if (!confirmDelete(`the ${b.metal} holding for ${b.customerName}`)) return;
    this.svc.deleteBullion(b.id);
  }
}
