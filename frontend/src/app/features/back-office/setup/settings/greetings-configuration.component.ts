import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GreetingTemplate } from '../setup-data.mock';
import { SetupService } from '../setup.service';

type GreetingDraft = Partial<GreetingTemplate>;

const EMPTY_DRAFT: GreetingDraft = { occasion: '', channel: 'Both', message: '', active: true };

@Component({
  selector: 'app-greetings-configuration',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './greetings-configuration.component.html',
})
export class GreetingsConfigurationComponent {
  readonly setup = inject(SetupService);

  readonly formMode = signal<'closed' | 'add' | 'edit'>('closed');
  readonly editingId = signal<string | null>(null);
  readonly draft = signal<GreetingDraft>({ ...EMPTY_DRAFT });

  readonly activeCount = computed(() => this.setup.greetingTemplates().filter((g) => g.active).length);

  openAdd(): void {
    this.draft.set({ ...EMPTY_DRAFT });
    this.editingId.set(null);
    this.formMode.set('add');
  }

  openEdit(g: GreetingTemplate): void {
    this.draft.set({ ...g });
    this.editingId.set(g.id);
    this.formMode.set('edit');
  }

  cancel(): void {
    this.formMode.set('closed');
    this.editingId.set(null);
  }

  setField<K extends keyof GreetingTemplate>(key: K, value: GreetingTemplate[K]): void {
    this.draft.update((d) => ({ ...d, [key]: value }));
  }

  save(): void {
    const d = this.draft();
    if (!d.occasion?.trim() || !d.message?.trim()) return;
    if (this.formMode() === 'edit' && this.editingId()) {
      this.setup.updateGreetingTemplate(this.editingId()!, d);
    } else {
      this.setup.addGreetingTemplate(d as Omit<GreetingTemplate, 'id'>);
    }
    this.cancel();
  }

  remove(id: string): void {
    this.setup.deleteGreetingTemplate(id);
    if (this.editingId() === id) this.cancel();
  }

  toggleActive(g: GreetingTemplate): void {
    this.setup.updateGreetingTemplate(g.id, { active: !g.active });
  }
}
