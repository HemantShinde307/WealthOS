import { Component, input, output, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { inject } from '@angular/core';
import { CreateTenantRequest, PlanDto, TenantSummaryDto } from '../../core/models/tenant.models';
import { PlatformService, apiError } from '../../core/services/platform.service';

const SLUG_RE = /^[a-z][a-z0-9-]{2,29}$/;
const INPUT = 'w-full px-3 py-2 border border-outline-variant rounded-md text-sm bg-surface-container-lowest focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30';

@Component({
  selector: 'app-create-tenant-form',
  standalone: true,
  template: `
    <div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 shadow-sm space-y-4">
      <h3 class="text-title-lg text-on-background">Create tenant</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        @for (f of fields; track f.key) {
          <div>
            <label class="text-sm font-medium text-on-background block mb-1">{{ f.label }}</label>
            <input [type]="f.type" [class]="inputClass" [placeholder]="f.hint" [value]="form()[f.key]" (input)="set(f.key, $any($event.target).value)" />
          </div>
        }
        <div>
          <label class="text-sm font-medium text-on-background block mb-1">Plan</label>
          <select [class]="inputClass" (change)="set('planCode', $any($event.target).value)">
            @for (p of plans(); track p.code) {
              <option [value]="p.code" [selected]="p.code === form().planCode">{{ p.name }}</option>
            }
          </select>
        </div>
        <div>
          <label class="text-sm font-medium text-on-background block mb-1">Trial days (0 = start active)</label>
          <input type="number" min="0" [class]="inputClass" [value]="form().trialDays" (input)="set('trialDays', $any($event.target).value)" />
        </div>
      </div>
      @if (error()) {
        <div class="bg-error-container/50 rounded-lg p-3 text-sm text-on-error-container">{{ error() }}</div>
      }
      <button class="px-4 py-2 bg-primary-container text-on-primary rounded font-medium text-sm hover:opacity-90 disabled:opacity-50" [disabled]="saving()" (click)="submit()">
        {{ saving() ? 'Creating…' : 'Create tenant' }}
      </button>
    </div>
  `,
})
export class CreateTenantFormComponent {
  private readonly api = inject(PlatformService);

  readonly plans = input<PlanDto[]>([]);
  readonly created = output<TenantSummaryDto>();

  readonly inputClass = INPUT;
  readonly fields: { key: 'slug' | 'name' | 'adminName' | 'adminEmail' | 'adminPassword'; label: string; type: string; hint: string }[] = [
    { key: 'slug', label: 'Slug (sub-domain)', type: 'text', hint: 'acme' },
    { key: 'name', label: 'Firm name', type: 'text', hint: 'Acme Wealth' },
    { key: 'adminName', label: 'Admin name', type: 'text', hint: '' },
    { key: 'adminEmail', label: 'Admin email', type: 'email', hint: '' },
    { key: 'adminPassword', label: 'Admin password (min 8)', type: 'password', hint: '' },
  ];

  readonly form = signal({ slug: '', name: '', planCode: '', trialDays: '14', adminName: '', adminEmail: '', adminPassword: '' });
  readonly error = signal<string | null>(null);
  readonly saving = signal(false);

  set(key: string, value: string): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  async submit(): Promise<void> {
    const f = this.form();
    const slug = f.slug.trim().toLowerCase();
    const days = Number(f.trialDays);
    const email = f.adminEmail.trim();
    if (!SLUG_RE.test(slug)) return this.error.set('Slug must be 3-30 characters: lowercase letters, digits or hyphens, starting with a letter.');
    if (f.name.trim().length < 2) return this.error.set('Enter the firm name.');
    if (f.adminName.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return this.error.set('Enter the admin name and a valid email.');
    if (f.adminPassword.length < 8) return this.error.set('Admin password must be at least 8 characters.');
    if (!Number.isInteger(days) || days < 0) return this.error.set('Trial days must be 0 or more.');

    const body: CreateTenantRequest = {
      slug,
      name: f.name.trim(),
      planCode: f.planCode || this.plans()[0]?.code || '',
      trialDays: days,
      adminName: f.adminName.trim(),
      adminEmail: email,
      adminPassword: f.adminPassword,
    };
    this.error.set(null);
    this.saving.set(true);
    try {
      this.created.emit(await firstValueFrom(this.api.createTenant(body)));
    } catch (err) {
      this.error.set(apiError(err));
    } finally {
      this.saving.set(false);
    }
  }
}
