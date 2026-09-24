import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Branch } from '../setup-data.mock';
import { SetupService } from '../setup.service';
import { ExportButtonComponent } from '../../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../../shared/utils/confirm';

type BranchDraft = Partial<Branch>;

const EMPTY_DRAFT: BranchDraft = { name: '', code: '', city: '', state: '', address: '', phone: '', email: '', managerName: '', openedOn: '', status: 'Active' };

@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [CommonModule, ExportButtonComponent],
  templateUrl: './branches.component.html',
})
export class BranchesComponent {
  readonly setup = inject(SetupService);

  readonly exportHeaders = ['Code', 'Name', 'City', 'State', 'Address', 'Phone', 'Email', 'Manager', 'Opened On', 'Status'];
  readonly exportRows = computed(() =>
    this.filtered().map((b) => [b.code, b.name, b.city, b.state, b.address, b.phone, b.email, b.managerName, b.openedOn, b.status]),
  );

  readonly searchTerm = signal('');
  readonly formMode = signal<'closed' | 'add' | 'edit'>('closed');
  readonly editingId = signal<string | null>(null);
  readonly draft = signal<BranchDraft>({ ...EMPTY_DRAFT });

  readonly filtered = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.setup.branches();
    return this.setup.branches().filter((b) => `${b.name} ${b.code} ${b.city} ${b.managerName}`.toLowerCase().includes(term));
  });

  readonly activeCount = computed(() => this.setup.branches().filter((b) => b.status === 'Active').length);

  openAdd(): void {
    this.draft.set({ ...EMPTY_DRAFT, openedOn: new Date().toISOString().slice(0, 10) });
    this.editingId.set(null);
    this.formMode.set('add');
  }

  openEdit(b: Branch): void {
    this.draft.set({ ...b });
    this.editingId.set(b.id);
    this.formMode.set('edit');
  }

  cancel(): void {
    this.formMode.set('closed');
    this.editingId.set(null);
  }

  setField<K extends keyof Branch>(key: K, value: Branch[K]): void {
    this.draft.update((d) => ({ ...d, [key]: value }));
  }

  save(): void {
    const d = this.draft();
    if (!d.name?.trim() || !d.code?.trim()) return;
    if (this.formMode() === 'edit' && this.editingId()) {
      this.setup.updateBranch(this.editingId()!, d);
    } else {
      this.setup.addBranch(d as Omit<Branch, 'id'>);
    }
    this.cancel();
  }

  remove(id: string): void {
    const name = this.setup.branchName(id);
    const inUse =
      this.setup.employees().some((e) => e.branchId === id) ||
      this.setup.associates().some((a) => a.branchId === id) ||
      this.setup.users().some((u) => u.branchId === id) ||
      this.setup.rmMappings().some((m) => m.branchIds.includes(id));
    if (inUse) {
      window.alert(`${name} still has employees, associates, users or RM mappings assigned. Reassign or remove them before deleting the branch.`);
      return;
    }
    if (!confirmDelete(`the branch ${name}`)) return;
    this.setup.deleteBranch(id);
    if (this.editingId() === id) this.cancel();
  }
}
