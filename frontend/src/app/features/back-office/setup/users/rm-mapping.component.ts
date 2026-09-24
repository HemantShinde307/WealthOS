import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RmMapping } from '../setup-data.mock';
import { SetupService } from '../setup.service';
import { ExportButtonComponent } from '../../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../../shared/utils/confirm';

type RmMappingDraft = Partial<RmMapping>;

const EMPTY_DRAFT: RmMappingDraft = { rmEmployeeId: '', branchIds: [], clientSegment: 'All Segments', clientCount: 0 };

@Component({
  selector: 'app-rm-mapping',
  standalone: true,
  imports: [CommonModule, ExportButtonComponent],
  templateUrl: './rm-mapping.component.html',
})
export class RmMappingComponent {
  readonly setup = inject(SetupService);

  readonly exportHeaders = ['Relationship Manager', 'Branches', 'Client Segment', 'Client Count', 'Mapped On'];
  readonly exportRows = computed(() =>
    this.setup.rmMappings().map((m) => [this.setup.employeeName(m.rmEmployeeId), this.branchLabels(m.branchIds), m.clientSegment, m.clientCount, m.mappedOn]),
  );

  readonly formMode = signal<'closed' | 'add' | 'edit'>('closed');
  readonly editingId = signal<string | null>(null);
  readonly draft = signal<RmMappingDraft>({ ...EMPTY_DRAFT });

  readonly relationshipManagers = computed(() => this.setup.employees().filter((e) => e.designation === 'Relationship Manager'));

  openAdd(): void {
    this.draft.set({ ...EMPTY_DRAFT, rmEmployeeId: this.relationshipManagers()[0]?.id ?? '' });
    this.editingId.set(null);
    this.formMode.set('add');
  }

  openEdit(m: RmMapping): void {
    this.draft.set({ ...m, branchIds: [...m.branchIds] });
    this.editingId.set(m.id);
    this.formMode.set('edit');
  }

  cancel(): void {
    this.formMode.set('closed');
    this.editingId.set(null);
  }

  setField<K extends keyof RmMapping>(key: K, value: RmMapping[K]): void {
    this.draft.update((d) => ({ ...d, [key]: value }));
  }

  toggleBranch(branchId: string): void {
    this.draft.update((d) => {
      const current = d.branchIds ?? [];
      const next = current.includes(branchId) ? current.filter((b) => b !== branchId) : [...current, branchId];
      return { ...d, branchIds: next };
    });
  }

  save(): void {
    const d = this.draft();
    if (!d.rmEmployeeId || !d.branchIds?.length) return;
    if (this.formMode() === 'edit' && this.editingId()) {
      this.setup.updateRmMapping(this.editingId()!, d);
    } else {
      this.setup.addRmMapping({ ...d, mappedOn: new Date().toISOString().slice(0, 10) } as Omit<RmMapping, 'id'>);
    }
    this.cancel();
  }

  remove(id: string): void {
    const item = this.setup.rmMappings().find((x) => x.id === id);
    if (!confirmDelete(`the mapping for ${item ? this.setup.employeeName(item.rmEmployeeId) : 'this RM'}`)) return;
    this.setup.deleteRmMapping(id);
    if (this.editingId() === id) this.cancel();
  }

  branchLabels(ids: string[]): string {
    return ids.map((id) => this.setup.branchName(id)).join(', ');
  }
}
