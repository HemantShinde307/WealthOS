import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchemeService } from '../../../core/services/scheme.service';

@Component({
  selector: 'app-tax-saving',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tax-saving.component.html',
})
export class TaxSavingComponent {
  readonly schemeService = inject(SchemeService);
  readonly section80cUsed = 0;
  readonly section80cLimit = 150000;

  // No ELSS holding in the imported portfolio — surface top-rated equity schemes as
  // ELSS alternatives to consider, since ELSS itself isn't in the current catalog.
  readonly suggestedSchemes = this.schemeService
    .schemes()
    .slice()
    .sort((a, b) => b.rating - a.rating || b.returns3y - a.returns3y)
    .slice(0, 4);
}
