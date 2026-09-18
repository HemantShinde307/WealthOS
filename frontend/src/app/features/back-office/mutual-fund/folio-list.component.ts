import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MutualFundService } from './mutual-fund.service';

@Component({
  selector: 'app-mf-folio-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './folio-list.component.html',
})
export class FolioListComponent {
  readonly mfService = inject(MutualFundService);

  readonly search = signal('');
  readonly amcFilter = signal('All');
  readonly statusFilter = signal('All');

  readonly amcs = computed(() => Array.from(new Set(this.mfService.folios().map((f) => f.amc))).sort());

  readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const amc = this.amcFilter();
    const status = this.statusFilter();
    return this.mfService.folios().filter((f) => {
      if (amc !== 'All' && f.amc !== amc) return false;
      if (status !== 'All' && f.status !== status) return false;
      if (!q) return true;
      return (
        f.folioNumber.toLowerCase().includes(q) ||
        f.scheme.toLowerCase().includes(q) ||
        f.customerName.toLowerCase().includes(q) ||
        f.pan.toLowerCase().includes(q)
      );
    });
  });

  readonly currentValue = (units: number, nav: number) => units * nav;
}
