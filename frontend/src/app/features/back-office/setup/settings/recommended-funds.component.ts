import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SetupService } from '../setup.service';

@Component({
  selector: 'app-recommended-funds',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recommended-funds.component.html',
})
export class RecommendedFundsComponent {
  readonly setup = inject(SetupService);

  readonly schemeName = signal('');
  readonly amc = signal('');
  readonly category = signal('');

  add(): void {
    if (!this.schemeName().trim() || !this.amc().trim()) return;
    this.setup.addRecommendedFund({
      schemeName: this.schemeName().trim(),
      amc: this.amc().trim(),
      category: this.category().trim() || 'Uncategorized',
      addedOn: new Date().toISOString().slice(0, 10),
    });
    this.schemeName.set('');
    this.amc.set('');
    this.category.set('');
  }

  remove(id: string): void {
    this.setup.removeRecommendedFund(id);
  }

  moveUp(id: string): void {
    this.setup.moveRecommendedFund(id, -1);
  }

  moveDown(id: string): void {
    this.setup.moveRecommendedFund(id, 1);
  }
}
