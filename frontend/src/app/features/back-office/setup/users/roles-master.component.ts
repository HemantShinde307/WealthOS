import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Role } from '../setup-data.mock';
import { SetupService } from '../setup.service';

type RoleDraft = Partial<Role>;

const EMPTY_DRAFT: RoleDraft = { name: '', description: '' };

@Component({
  selector: 'app-roles-master',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './roles-master.component.html',
})
export class RolesMasterComponent {
  readonly setup = inject(SetupService);

  readonly searchTerm = signal('');
  readonly formMode = signal<'closed' | 'add' | 'edit'>('closed');
  readonly editingId = signal<string | null>(null);
  readonly draft = signal<RoleDraft>({ ...EMPTY_DRAFT });

  readonly filtered = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.setup.roles();
    return this.setup.roles().filter((r) => `${r.name} ${r.description}`.toLowerCase().includes(term));
  });

  privilegeCount(roleId: string): number {
    return (this.setup.rolePrivileges()[roleId] ?? []).length;
  }

  openAdd(): void {
    this.draft.set({ ...EMPTY_DRAFT });
    this.editingId.set(null);
    this.formMode.set('add');
  }

  openEdit(r: Role): void {
    this.draft.set({ ...r });
    this.editingId.set(r.id);
    this.formMode.set('edit');
  }

  cancel(): void {
    this.formMode.set('closed');
    this.editingId.set(null);
  }

  setField<K extends keyof Role>(key: K, value: Role[K]): void {
    this.draft.update((d) => ({ ...d, [key]: value }));
  }

  save(): void {
    const d = this.draft();
    if (!d.name?.trim()) return;
    if (this.formMode() === 'edit' && this.editingId()) {
      this.setup.updateRole(this.editingId()!, d);
    } else {
      this.setup.addRole({ ...d, createdOn: new Date().toISOString().slice(0, 10) } as Omit<Role, 'id'>);
    }
    this.cancel();
  }

  remove(id: string): void {
    if (this.setup.userCountForRole(id) > 0) return;
    this.setup.deleteRole(id);
    if (this.editingId() === id) this.cancel();
  }
}
