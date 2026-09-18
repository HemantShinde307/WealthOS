import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SetupScheduledReport } from '../setup-data.mock';
import { SetupService } from '../setup.service';

type ReportDraft = Partial<SetupScheduledReport>;

const EMPTY_DRAFT: ReportDraft = { reportName: '', recipientGroup: '', frequency: '', nextRun: '', status: 'Active' };

@Component({
  selector: 'app-scheduled-reports-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scheduled-reports-management.component.html',
})
export class ScheduledReportsManagementComponent {
  readonly setup = inject(SetupService);

  readonly searchTerm = signal('');
  readonly formMode = signal<'closed' | 'add' | 'edit'>('closed');
  readonly editingId = signal<string | null>(null);
  readonly draft = signal<ReportDraft>({ ...EMPTY_DRAFT });

  readonly filtered = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.setup.setupScheduledReports();
    return this.setup.setupScheduledReports().filter((r) => `${r.reportName} ${r.recipientGroup}`.toLowerCase().includes(term));
  });

  readonly activeCount = computed(() => this.setup.setupScheduledReports().filter((r) => r.status === 'Active').length);

  openAdd(): void {
    this.draft.set({ ...EMPTY_DRAFT, nextRun: new Date().toISOString().slice(0, 10) });
    this.editingId.set(null);
    this.formMode.set('add');
  }

  openEdit(r: SetupScheduledReport): void {
    this.draft.set({ ...r });
    this.editingId.set(r.id);
    this.formMode.set('edit');
  }

  cancel(): void {
    this.formMode.set('closed');
    this.editingId.set(null);
  }

  setField<K extends keyof SetupScheduledReport>(key: K, value: SetupScheduledReport[K]): void {
    this.draft.update((d) => ({ ...d, [key]: value }));
  }

  save(): void {
    const d = this.draft();
    if (!d.reportName?.trim() || !d.recipientGroup?.trim()) return;
    if (this.formMode() === 'edit' && this.editingId()) {
      this.setup.updateSetupScheduledReport(this.editingId()!, d);
    } else {
      this.setup.addSetupScheduledReport(d as Omit<SetupScheduledReport, 'id'>);
    }
    this.cancel();
  }

  remove(id: string): void {
    this.setup.deleteSetupScheduledReport(id);
    if (this.editingId() === id) this.cancel();
  }

  toggle(id: string): void {
    this.setup.toggleSetupScheduledReport(id);
  }
}
