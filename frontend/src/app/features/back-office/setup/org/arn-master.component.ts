import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArnRecord } from '../setup-data.mock';
import { SetupService } from '../setup.service';
import { ExportButtonComponent } from '../../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../../shared/utils/confirm';

type ArnDraft = Partial<ArnRecord>;

const EMPTY_DRAFT: ArnDraft = { arnCode: '', holderName: '', category: 'Individual', validTill: '', empanelledOn: '', status: 'Active' };

@Component({
  selector: 'app-arn-master',
  standalone: true,
  imports: [CommonModule, ExportButtonComponent],
  templateUrl: './arn-master.component.html',
})
export class ArnMasterComponent {
  readonly setup = inject(SetupService);

  readonly exportHeaders = ['ARN', 'Holder', 'Category', 'Empanelled On', 'Valid Till', 'Status'];
  readonly exportRows = computed(() =>
    this.filtered().map((a) => [a.arnCode, a.holderName, a.category, a.empanelledOn, a.validTill, a.status]),
  );

  readonly searchTerm = signal('');
  readonly formMode = signal<'closed' | 'add' | 'edit'>('closed');
  readonly editingId = signal<string | null>(null);
  readonly draft = signal<ArnDraft>({ ...EMPTY_DRAFT });

  readonly filtered = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.setup.arnRecords();
    return this.setup.arnRecords().filter((a) => `${a.arnCode} ${a.holderName}`.toLowerCase().includes(term));
  });

  openAdd(): void {
    this.draft.set({ ...EMPTY_DRAFT, empanelledOn: new Date().toISOString().slice(0, 10) });
    this.editingId.set(null);
    this.formMode.set('add');
  }

  openEdit(a: ArnRecord): void {
    this.draft.set({ ...a });
    this.editingId.set(a.id);
    this.formMode.set('edit');
  }

  cancel(): void {
    this.formMode.set('closed');
    this.editingId.set(null);
  }

  setField<K extends keyof ArnRecord>(key: K, value: ArnRecord[K]): void {
    this.draft.update((d) => ({ ...d, [key]: value }));
  }

  save(): void {
    const d = this.draft();
    if (!d.arnCode?.trim() || !d.holderName?.trim()) return;
    if (this.formMode() === 'edit' && this.editingId()) {
      this.setup.updateArnRecord(this.editingId()!, d);
    } else {
      this.setup.addArnRecord(d as Omit<ArnRecord, 'id'>);
    }
    this.cancel();
  }

  remove(id: string): void {
    const item = this.setup.arnRecords().find((x) => x.id === id);
    if (!confirmDelete(`ARN ${item?.arnCode ?? ''}`)) return;
    this.setup.deleteArnRecord(id);
    if (this.editingId() === id) this.cancel();
  }
}
