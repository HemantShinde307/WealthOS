import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FamilyOfficeService } from '../family-office.service';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';

@Component({
  selector: 'app-member-management',
  standalone: true,
  imports: [CommonModule, RouterLink, InrCompactPipe],
  templateUrl: './member-management.component.html',
})
export class MemberManagementComponent {
  readonly familyOffice = inject(FamilyOfficeService);

  readonly searchTerm = signal('');

  readonly members = this.familyOffice.members;

  readonly filteredMembers = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.members();
    return this.members().filter(
      (m) => m.name.toLowerCase().includes(term) || m.relationship.toLowerCase().includes(term),
    );
  });

  readonly activeCount = computed(() => this.members().filter((m) => m.status === 'Active').length);
  readonly pendingImports = this.familyOffice.pendingCasCount;

  onSearchInput(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }
}
