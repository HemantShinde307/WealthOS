import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AreaRecord } from '../setup-data.mock';
import { SetupService } from '../setup.service';
import { ExportButtonComponent } from '../../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../../shared/utils/confirm';

type AreaDraft = Partial<AreaRecord>;

const EMPTY_DRAFT: AreaDraft = { areaName: '', pincode: '', city: '', state: '', status: 'Active' };

@Component({
  selector: 'app-area-master',
  standalone: true,
  imports: [CommonModule, ExportButtonComponent],
  templateUrl: './area-master.component.html',
})
export class AreaMasterComponent {
  readonly setup = inject(SetupService);

  readonly exportHeaders = ['Area', 'Pincode', 'City', 'State', 'Status'];
  readonly exportRows = computed(() =>
    this.filtered().map((a) => [a.areaName, a.pincode, a.city, a.state, a.status]),
  );

  readonly searchTerm = signal('');
  readonly formMode = signal<'closed' | 'add' | 'edit'>('closed');
  readonly editingId = signal<string | null>(null);
  readonly draft = signal<AreaDraft>({ ...EMPTY_DRAFT });

  readonly filtered = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.setup.areas();
    return this.setup.areas().filter((a) => `${a.areaName} ${a.pincode} ${a.city} ${a.state}`.toLowerCase().includes(term));
  });

  openAdd(): void {
    this.draft.set({ ...EMPTY_DRAFT });
    this.editingId.set(null);
    this.formMode.set('add');
  }

  openEdit(a: AreaRecord): void {
    this.draft.set({ ...a });
    this.editingId.set(a.id);
    this.formMode.set('edit');
  }

  cancel(): void {
    this.formMode.set('closed');
    this.editingId.set(null);
  }

  setField<K extends keyof AreaRecord>(key: K, value: AreaRecord[K]): void {
    this.draft.update((d) => ({ ...d, [key]: value }));
  }

  save(): void {
    const d = this.draft();
    if (!d.areaName?.trim() || !d.pincode?.trim()) return;
    if (this.formMode() === 'edit' && this.editingId()) {
      this.setup.updateArea(this.editingId()!, d);
    } else {
      this.setup.addArea(d as Omit<AreaRecord, 'id'>);
    }
    this.cancel();
  }

  remove(id: string): void {
    const item = this.setup.areas().find((x) => x.id === id);
    if (!confirmDelete(`${item?.areaName ?? 'this area'}`)) return;
    this.setup.deleteArea(id);
    if (this.editingId() === id) this.cancel();
  }
}
