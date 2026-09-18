import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackOfficeCustomerService } from '../back-office-customer.service';

@Component({
  selector: 'app-renumber-group-codes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './renumber-group-codes.component.html',
})
export class RenumberGroupCodesComponent {
  readonly boService = inject(BackOfficeCustomerService);

  readonly applied = signal(false);

  readonly preview = computed(() => {
    const sorted = [...this.boService.groups()].sort((a, b) => a.createdOn.localeCompare(b.createdOn));
    return sorted.map((g, i) => ({ oldId: g.id, newId: `GRP-${String(i + 1).padStart(3, '0')}`, name: g.name }));
  });

  readonly changedCount = computed(() => this.preview().filter((r) => r.oldId !== r.newId).length);

  apply(): void {
    this.boService.renumberGroupCodes();
    this.applied.set(true);
  }
}
