import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Agency } from '../setup-data.mock';
import { SetupService } from '../setup.service';
import { ExportButtonComponent } from '../../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../../shared/utils/confirm';

type AgencyDraft = Partial<Agency>;

const EMPTY_DRAFT: AgencyDraft = { agencyCode: '', name: '', type: 'Bank', contactPerson: '', phone: '', email: '', city: '', status: 'Active' };

@Component({
  selector: 'app-agencies',
  standalone: true,
  imports: [CommonModule, ExportButtonComponent],
  templateUrl: './agencies.component.html',
})
export class AgenciesComponent {
  readonly setup = inject(SetupService);

  readonly exportHeaders = ['Code', 'Agency', 'Type', 'Contact Person', 'Phone', 'Email', 'City', 'Status'];
  readonly exportRows = computed(() =>
    this.filtered().map((a) => [a.agencyCode, a.name, a.type, a.contactPerson, a.phone, a.email, a.city, a.status]),
  );

  readonly searchTerm = signal('');
  readonly formMode = signal<'closed' | 'add' | 'edit'>('closed');
  readonly editingId = signal<string | null>(null);
  readonly draft = signal<AgencyDraft>({ ...EMPTY_DRAFT });

  readonly filtered = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.setup.agencies();
    return this.setup.agencies().filter((a) => `${a.name} ${a.agencyCode} ${a.type} ${a.city}`.toLowerCase().includes(term));
  });

  openAdd(): void {
    this.draft.set({ ...EMPTY_DRAFT });
    this.editingId.set(null);
    this.formMode.set('add');
  }

  openEdit(a: Agency): void {
    this.draft.set({ ...a });
    this.editingId.set(a.id);
    this.formMode.set('edit');
  }

  cancel(): void {
    this.formMode.set('closed');
    this.editingId.set(null);
  }

  setField<K extends keyof Agency>(key: K, value: Agency[K]): void {
    this.draft.update((d) => ({ ...d, [key]: value }));
  }

  save(): void {
    const d = this.draft();
    if (!d.name?.trim() || !d.agencyCode?.trim()) return;
    if (this.formMode() === 'edit' && this.editingId()) {
      this.setup.updateAgency(this.editingId()!, d);
    } else {
      this.setup.addAgency(d as Omit<Agency, 'id'>);
    }
    this.cancel();
  }

  remove(id: string): void {
    const item = this.setup.agencies().find((x) => x.id === id);
    if (!confirmDelete(`${item?.name ?? 'this agency'}`)) return;
    this.setup.deleteAgency(id);
    if (this.editingId() === id) this.cancel();
  }
}
