import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Associate } from '../setup-data.mock';
import { SetupService } from '../setup.service';
import { ExportButtonComponent } from '../../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../../shared/utils/confirm';

type AssociateDraft = Partial<Associate>;

const EMPTY_DRAFT: AssociateDraft = { associateCode: '', name: '', arnCode: '', branchId: '', commissionSlab: '', phone: '', email: '', status: 'Active' };

@Component({
  selector: 'app-associates',
  standalone: true,
  imports: [CommonModule, ExportButtonComponent],
  templateUrl: './associates.component.html',
})
export class AssociatesComponent {
  readonly setup = inject(SetupService);

  readonly exportHeaders = ['Code', 'Name', 'ARN', 'Branch', 'Commission Slab', 'Phone', 'Email', 'Status'];
  readonly exportRows = computed(() =>
    this.filtered().map((a) => [a.associateCode, a.name, a.arnCode, this.setup.branchName(a.branchId), a.commissionSlab, a.phone, a.email, a.status]),
  );

  readonly searchTerm = signal('');
  readonly formMode = signal<'closed' | 'add' | 'edit'>('closed');
  readonly editingId = signal<string | null>(null);
  readonly draft = signal<AssociateDraft>({ ...EMPTY_DRAFT });

  readonly filtered = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.setup.associates();
    return this.setup.associates().filter((a) => `${a.name} ${a.associateCode} ${a.arnCode}`.toLowerCase().includes(term));
  });

  openAdd(): void {
    this.draft.set({ ...EMPTY_DRAFT, branchId: this.setup.branches()[0]?.id ?? '' });
    this.editingId.set(null);
    this.formMode.set('add');
  }

  openEdit(a: Associate): void {
    this.draft.set({ ...a });
    this.editingId.set(a.id);
    this.formMode.set('edit');
  }

  cancel(): void {
    this.formMode.set('closed');
    this.editingId.set(null);
  }

  setField<K extends keyof Associate>(key: K, value: Associate[K]): void {
    this.draft.update((d) => ({ ...d, [key]: value }));
  }

  save(): void {
    const d = this.draft();
    if (!d.name?.trim() || !d.associateCode?.trim()) return;
    if (this.formMode() === 'edit' && this.editingId()) {
      this.setup.updateAssociate(this.editingId()!, d);
    } else {
      this.setup.addAssociate(d as Omit<Associate, 'id'>);
    }
    this.cancel();
  }

  remove(id: string): void {
    const item = this.setup.associates().find((x) => x.id === id);
    if (!confirmDelete(`${item?.name ?? 'this associate'}`)) return;
    this.setup.deleteAssociate(id);
    if (this.editingId() === id) this.cancel();
  }
}
