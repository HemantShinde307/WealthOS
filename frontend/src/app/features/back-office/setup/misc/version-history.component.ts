import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VersionHistoryEntry } from '../setup-data.mock';
import { SetupService } from '../setup.service';

type TypeFilter = 'All' | VersionHistoryEntry['type'];

@Component({
  selector: 'app-version-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './version-history.component.html',
})
export class VersionHistoryComponent {
  readonly setup = inject(SetupService);

  readonly typeFilter = signal<TypeFilter>('All');

  readonly filtered = computed(() => {
    const type = this.typeFilter();
    return this.setup.versionHistory().filter((v) => type === 'All' || v.type === type);
  });

  typeIcon(type: VersionHistoryEntry['type']): string {
    if (type === 'Feature') return 'auto_awesome';
    if (type === 'Fix') return 'build';
    if (type === 'Security') return 'shield';
    return 'trending_up';
  }

  typeClass(type: VersionHistoryEntry['type']): string {
    if (type === 'Feature') return 'bg-primary-container/40 text-on-primary-container';
    if (type === 'Fix') return 'bg-error/10 text-error';
    if (type === 'Security') return 'bg-on-tertiary-container/10 text-on-tertiary-container';
    return 'bg-surface-container-low text-on-surface-variant';
  }
}
