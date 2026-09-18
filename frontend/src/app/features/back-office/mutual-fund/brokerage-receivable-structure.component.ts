import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MutualFundService } from './mutual-fund.service';
import { BrokerageSlab } from './mutual-fund-data.mock';

interface SlabDraft {
  schemeCategory: string;
  upfrontPct: number | null;
  trailPct: number | null;
  effectiveFrom: string;
  effectiveTo: string;
}

const EMPTY_DRAFT: SlabDraft = { schemeCategory: '', upfrontPct: null, trailPct: null, effectiveFrom: new Date().toISOString().slice(0, 10), effectiveTo: '' };

@Component({
  selector: 'app-mf-brokerage-receivable-structure',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './brokerage-receivable-structure.component.html',
})
export class BrokerageReceivableStructureComponent {
  readonly mfService = inject(MutualFundService);

  readonly showForm = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly draft = signal<SlabDraft>({ ...EMPTY_DRAFT });
  readonly error = signal<string | null>(null);

  startCreate(): void {
    this.editingId.set(null);
    this.draft.set({ ...EMPTY_DRAFT });
    this.error.set(null);
    this.showForm.set(true);
  }

  startEdit(slab: BrokerageSlab): void {
    this.editingId.set(slab.id);
    this.draft.set({ schemeCategory: slab.schemeCategory, upfrontPct: slab.upfrontPct, trailPct: slab.trailPct, effectiveFrom: slab.effectiveFrom, effectiveTo: slab.effectiveTo ?? '' });
    this.error.set(null);
    this.showForm.set(true);
  }

  cancel(): void {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  save(): void {
    const d = this.draft();
    if (!d.schemeCategory.trim()) { this.error.set('Enter a scheme category.'); return; }
    if (d.upfrontPct === null || d.upfrontPct < 0) { this.error.set('Enter a valid upfront %.'); return; }
    if (d.trailPct === null || d.trailPct < 0) { this.error.set('Enter a valid trail %.'); return; }
    const payload = { schemeCategory: d.schemeCategory.trim(), upfrontPct: d.upfrontPct, trailPct: d.trailPct, effectiveFrom: d.effectiveFrom, effectiveTo: d.effectiveTo || null };
    const editing = this.editingId();
    if (editing) {
      this.mfService.updateBrokerageSlab(editing, payload);
    } else {
      this.mfService.addBrokerageSlab(payload);
    }
    this.showForm.set(false);
    this.editingId.set(null);
  }

  remove(id: string): void {
    this.mfService.deleteBrokerageSlab(id);
  }

  setField<K extends keyof SlabDraft>(key: K, value: SlabDraft[K]): void {
    this.draft.update((d) => ({ ...d, [key]: value }));
  }
}
