import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SchemeService } from '../../../core/services/scheme.service';
import { SipSetupStateService } from './sip-setup-state.service';

@Component({
  selector: 'app-sip-select-scheme',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select-scheme.component.html',
})
export class SelectSchemeComponent {
  private readonly schemeService = inject(SchemeService);
  private readonly state = inject(SipSetupStateService);
  private readonly router = inject(Router);

  readonly search = signal('');
  readonly assetFilter = signal<string>('All');
  readonly assetClasses = ['All', 'Equity', 'Debt', 'Hybrid'];

  readonly filteredSchemes = computed(() => {
    const term = this.search().toLowerCase();
    const filter = this.assetFilter();
    return this.schemeService
      .schemes()
      .filter((s) => (filter === 'All' || s.assetClass === filter) && s.name.toLowerCase().includes(term));
  });

  select(schemeId: string): void {
    this.state.selectedSchemeId.set(schemeId);
    this.router.navigate(['/sip-setup/investment-details']);
  }
}
