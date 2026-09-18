import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserAccount } from '../setup-data.mock';
import { SetupService } from '../setup.service';

type UserDraft = Partial<UserAccount>;

const EMPTY_DRAFT: UserDraft = { username: '', name: '', email: '', roleId: '', branchId: null, status: 'Active' };

@Component({
  selector: 'app-user-master',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-master.component.html',
})
export class UserMasterComponent {
  readonly setup = inject(SetupService);

  readonly searchTerm = signal('');
  readonly formMode = signal<'closed' | 'add' | 'edit'>('closed');
  readonly editingId = signal<string | null>(null);
  readonly draft = signal<UserDraft>({ ...EMPTY_DRAFT });

  readonly filtered = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.setup.users();
    return this.setup.users().filter((u) => `${u.name} ${u.username} ${u.email}`.toLowerCase().includes(term));
  });

  openAdd(): void {
    this.draft.set({ ...EMPTY_DRAFT, roleId: this.setup.roles()[0]?.id ?? '' });
    this.editingId.set(null);
    this.formMode.set('add');
  }

  openEdit(u: UserAccount): void {
    this.draft.set({ ...u });
    this.editingId.set(u.id);
    this.formMode.set('edit');
  }

  cancel(): void {
    this.formMode.set('closed');
    this.editingId.set(null);
  }

  setField<K extends keyof UserAccount>(key: K, value: UserAccount[K]): void {
    this.draft.update((d) => ({ ...d, [key]: value }));
  }

  save(): void {
    const d = this.draft();
    if (!d.name?.trim() || !d.username?.trim()) return;
    if (this.formMode() === 'edit' && this.editingId()) {
      this.setup.updateUser(this.editingId()!, d);
    } else {
      this.setup.addUser({ ...d, lastLogin: null } as Omit<UserAccount, 'id'>);
    }
    this.cancel();
  }

  remove(id: string): void {
    this.setup.deleteUser(id);
    if (this.editingId() === id) this.cancel();
  }
}
