import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IntimationTemplate } from '../setup-data.mock';
import { SetupService } from '../setup.service';

type TemplateDraft = Partial<IntimationTemplate>;

const EMPTY_DRAFT: TemplateDraft = { name: '', channel: 'SMS', trigger: '', content: '', status: 'Active' };

@Component({
  selector: 'app-intimation-templates',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './intimation-templates.component.html',
})
export class IntimationTemplatesComponent {
  readonly setup = inject(SetupService);

  readonly searchTerm = signal('');
  readonly formMode = signal<'closed' | 'add' | 'edit'>('closed');
  readonly editingId = signal<string | null>(null);
  readonly draft = signal<TemplateDraft>({ ...EMPTY_DRAFT });

  readonly filtered = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.setup.intimationTemplates();
    return this.setup.intimationTemplates().filter((t) => `${t.name} ${t.trigger} ${t.channel}`.toLowerCase().includes(term));
  });

  openAdd(): void {
    this.draft.set({ ...EMPTY_DRAFT });
    this.editingId.set(null);
    this.formMode.set('add');
  }

  openEdit(t: IntimationTemplate): void {
    this.draft.set({ ...t });
    this.editingId.set(t.id);
    this.formMode.set('edit');
  }

  cancel(): void {
    this.formMode.set('closed');
    this.editingId.set(null);
  }

  setField<K extends keyof IntimationTemplate>(key: K, value: IntimationTemplate[K]): void {
    this.draft.update((d) => ({ ...d, [key]: value }));
  }

  save(): void {
    const d = this.draft();
    if (!d.name?.trim() || !d.content?.trim()) return;
    if (this.formMode() === 'edit' && this.editingId()) {
      this.setup.updateIntimationTemplate(this.editingId()!, d);
    } else {
      this.setup.addIntimationTemplate(d as Omit<IntimationTemplate, 'id'>);
    }
    this.cancel();
  }

  remove(id: string): void {
    this.setup.deleteIntimationTemplate(id);
    if (this.editingId() === id) this.cancel();
  }
}
