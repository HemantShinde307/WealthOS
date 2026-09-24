import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SetupService } from '../setup.service';
import { RecommendedFund } from '../setup-data.mock';
import { ExportButtonComponent } from '../../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../../shared/utils/confirm';

@Component({
  selector: 'app-recommended-funds',
  standalone: true,
  imports: [CommonModule, ExportButtonComponent],
  templateUrl: './recommended-funds.component.html',
})
export class RecommendedFundsComponent {
  readonly setup = inject(SetupService);

  readonly exportHeaders = ['Rank', 'Scheme', 'AMC', 'Category', 'Added On'];
  readonly exportRows = computed(() => this.setup.recommendedFunds().map((f) => [f.rank, f.schemeName, f.amc, f.category, f.addedOn]));

  readonly editingId = signal<string | null>(null);
  readonly schemeName = signal('');
  readonly amc = signal('');
  readonly category = signal('');

  add(): void {
    if (!this.schemeName().trim() || !this.amc().trim()) return;
    const id = this.editingId();
    if (id) {
      this.setup.updateRecommendedFund(id, {
        schemeName: this.schemeName().trim(),
        amc: this.amc().trim(),
        category: this.category().trim() || 'Uncategorized',
      });
    } else {
      this.setup.addRecommendedFund({
        schemeName: this.schemeName().trim(),
        amc: this.amc().trim(),
        category: this.category().trim() || 'Uncategorized',
        addedOn: new Date().toISOString().slice(0, 10),
      });
    }
    this.clearForm();
  }

  edit(f: RecommendedFund): void {
    this.editingId.set(f.id);
    this.schemeName.set(f.schemeName);
    this.amc.set(f.amc);
    this.category.set(f.category);
  }

  clearForm(): void {
    this.editingId.set(null);
    this.schemeName.set('');
    this.amc.set('');
    this.category.set('');
  }

  remove(f: RecommendedFund): void {
    if (!confirmDelete(f.schemeName)) return;
    this.setup.removeRecommendedFund(f.id);
    if (this.editingId() === f.id) this.clearForm();
  }

  moveUp(id: string): void {
    this.setup.moveRecommendedFund(id, -1);
  }

  moveDown(id: string): void {
    this.setup.moveRecommendedFund(id, 1);
  }
}
