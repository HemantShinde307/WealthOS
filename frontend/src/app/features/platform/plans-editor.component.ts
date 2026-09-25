import { Component, inject, input, output, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PlanDto } from '../../core/models/tenant.models';
import { PlatformService, apiError } from '../../core/services/platform.service';

type NumField = 'maxUsers' | 'maxClients' | 'maxStorageMb' | 'monthlyPriceInr';

@Component({
  selector: 'app-plans-editor',
  standalone: true,
  template: `
    @if (error()) {
      <div class="bg-error-container/50 rounded-lg p-3 text-sm text-on-error-container">{{ error() }}</div>
    }
    <div class="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm overflow-x-auto">
      <table class="w-full text-sm text-left">
        <thead class="bg-surface-container-low text-on-surface-variant text-xs uppercase tracking-wider">
          <tr>
            <th class="px-4 py-3">Plan</th>
            @for (c of cols; track c.key) {
              <th class="px-4 py-3">{{ c.label }}</th>
            }
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-outline-variant">
          @for (p of plans(); track p.code) {
            <tr>
              <td class="px-4 py-3 font-medium text-on-background">{{ p.name }} <span class="text-xs text-on-surface-variant font-mono">{{ p.code }}</span></td>
              @for (c of cols; track c.key) {
                <td class="px-4 py-3">
                  <input
                    type="number"
                    min="0"
                    class="w-28 border border-outline-variant rounded-md px-2 py-1 text-sm bg-surface-container-lowest font-mono"
                    [value]="p[c.key]"
                    (input)="edit(p.code, c.key, $any($event.target).value)"
                  />
                </td>
              }
              <td class="px-4 py-3 text-right">
                <button class="text-secondary text-sm font-medium hover:underline disabled:opacity-50" [disabled]="saving() === p.code" (click)="save(p.code)">
                  {{ saving() === p.code ? 'Saving…' : 'Save' }}
                </button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class PlansEditorComponent {
  private readonly api = inject(PlatformService);

  readonly plans = input<PlanDto[]>([]);
  readonly changed = output<PlanDto[]>();

  readonly cols: { key: NumField; label: string }[] = [
    { key: 'maxUsers', label: 'Max users' },
    { key: 'maxClients', label: 'Max clients' },
    { key: 'maxStorageMb', label: 'Storage (MB)' },
    { key: 'monthlyPriceInr', label: 'Price / month (₹)' },
  ];

  readonly saving = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  private readonly drafts = new Map<string, Partial<Record<NumField, number>>>();

  edit(code: string, key: NumField, value: string): void {
    this.drafts.set(code, { ...this.drafts.get(code), [key]: Number(value) });
  }

  async save(code: string): Promise<void> {
    const draft = this.drafts.get(code);
    if (!draft) return;
    if (Object.values(draft).some((v) => !Number.isFinite(v) || (v as number) < 0)) {
      this.error.set('Limits and prices must be zero or positive numbers.');
      return;
    }
    this.error.set(null);
    this.saving.set(code);
    try {
      const updated = await firstValueFrom(this.api.updatePlan(code, draft));
      this.drafts.delete(code);
      this.changed.emit(this.plans().map((p) => (p.code === code ? updated : p)));
    } catch (err) {
      this.error.set(apiError(err));
    } finally {
      this.saving.set(null);
    }
  }
}
