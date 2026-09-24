import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HolidayRecord } from '../setup-data.mock';
import { SetupService } from '../setup.service';
import { ExportButtonComponent } from '../../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../../shared/utils/confirm';

type HolidayDraft = Partial<HolidayRecord>;

const EMPTY_DRAFT: HolidayDraft = { date: '', name: '', type: 'National', status: 'Active' };

@Component({
  selector: 'app-holidays-master',
  standalone: true,
  imports: [CommonModule, ExportButtonComponent],
  templateUrl: './holidays-master.component.html',
})
export class HolidaysMasterComponent {
  readonly setup = inject(SetupService);

  readonly exportHeaders = ['Date', 'Holiday', 'Type', 'Status'];
  readonly exportRows = computed(() =>
    this.setup.holidays().map((h) => [h.date, h.name, h.type, h.status]),
  );

  readonly formMode = signal<'closed' | 'add' | 'edit'>('closed');
  readonly editingId = signal<string | null>(null);
  readonly draft = signal<HolidayDraft>({ ...EMPTY_DRAFT });

  readonly upcomingCount = computed(() => {
    const today = new Date().toISOString().slice(0, 10);
    return this.setup.holidays().filter((h) => h.date >= today && h.status === 'Active').length;
  });

  openAdd(): void {
    this.draft.set({ ...EMPTY_DRAFT });
    this.editingId.set(null);
    this.formMode.set('add');
  }

  openEdit(h: HolidayRecord): void {
    this.draft.set({ ...h });
    this.editingId.set(h.id);
    this.formMode.set('edit');
  }

  cancel(): void {
    this.formMode.set('closed');
    this.editingId.set(null);
  }

  setField<K extends keyof HolidayRecord>(key: K, value: HolidayRecord[K]): void {
    this.draft.update((d) => ({ ...d, [key]: value }));
  }

  save(): void {
    const d = this.draft();
    if (!d.date?.trim() || !d.name?.trim()) return;
    if (this.formMode() === 'edit' && this.editingId()) {
      this.setup.updateHoliday(this.editingId()!, d);
    } else {
      this.setup.addHoliday(d as Omit<HolidayRecord, 'id'>);
    }
    this.cancel();
  }

  remove(id: string): void {
    const item = this.setup.holidays().find((x) => x.id === id);
    if (!confirmDelete(`${item?.name ?? 'this holiday'}`)) return;
    this.setup.deleteHoliday(id);
    if (this.editingId() === id) this.cancel();
  }
}
