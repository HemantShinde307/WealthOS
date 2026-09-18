import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrincipalBrokerRelationship } from '../setup-data.mock';
import { SetupService } from '../setup.service';

type PbrDraft = Partial<PrincipalBrokerRelationship>;

const EMPTY_DRAFT: PbrDraft = { principalName: '', brokerCode: '', agreementDate: '', commissionType: 'Trail', status: 'Active' };

@Component({
  selector: 'app-principal-broker-relationships',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './principal-broker-relationships.component.html',
})
export class PrincipalBrokerRelationshipsComponent {
  readonly setup = inject(SetupService);

  readonly searchTerm = signal('');
  readonly formMode = signal<'closed' | 'add' | 'edit'>('closed');
  readonly editingId = signal<string | null>(null);
  readonly draft = signal<PbrDraft>({ ...EMPTY_DRAFT });

  readonly filtered = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.setup.principalBrokerRelationships();
    return this.setup.principalBrokerRelationships().filter((p) => `${p.principalName} ${p.brokerCode}`.toLowerCase().includes(term));
  });

  openAdd(): void {
    this.draft.set({ ...EMPTY_DRAFT, agreementDate: new Date().toISOString().slice(0, 10) });
    this.editingId.set(null);
    this.formMode.set('add');
  }

  openEdit(p: PrincipalBrokerRelationship): void {
    this.draft.set({ ...p });
    this.editingId.set(p.id);
    this.formMode.set('edit');
  }

  cancel(): void {
    this.formMode.set('closed');
    this.editingId.set(null);
  }

  setField<K extends keyof PrincipalBrokerRelationship>(key: K, value: PrincipalBrokerRelationship[K]): void {
    this.draft.update((d) => ({ ...d, [key]: value }));
  }

  save(): void {
    const d = this.draft();
    if (!d.principalName?.trim() || !d.brokerCode?.trim()) return;
    if (this.formMode() === 'edit' && this.editingId()) {
      this.setup.updatePrincipalBrokerRelationship(this.editingId()!, d);
    } else {
      this.setup.addPrincipalBrokerRelationship(d as Omit<PrincipalBrokerRelationship, 'id'>);
    }
    this.cancel();
  }

  remove(id: string): void {
    this.setup.deletePrincipalBrokerRelationship(id);
    if (this.editingId() === id) this.cancel();
  }
}
