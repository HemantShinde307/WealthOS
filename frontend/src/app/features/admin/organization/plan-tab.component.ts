import { Component, computed, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TenantMeDto } from '../../../core/models/tenant.models';

interface Meter {
  label: string;
  used: number;
  max: number;
  unit: string;
}

@Component({
  selector: 'app-plan-tab',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 shadow-sm space-y-6 max-w-2xl">
      <div class="flex flex-wrap justify-between items-start gap-3">
        <div>
          <p class="text-xs uppercase tracking-wider text-on-surface-variant">Current plan</p>
          <h3 class="text-title-lg text-on-background">{{ me().plan.name }}</h3>
          <p class="text-sm text-on-surface-variant">₹{{ me().plan.monthlyPriceInr }} / month</p>
        </div>
        <div class="text-right">
          <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary-fixed text-on-secondary-fixed">{{ me().status }}</span>
          @if (me().trialEndsAt) {
            <p class="text-xs text-on-surface-variant mt-1">Trial ends {{ me().trialEndsAt | date: 'mediumDate' }}</p>
          }
        </div>
      </div>

      @for (m of meters(); track m.label) {
        <div>
          <div class="flex justify-between text-sm mb-1">
            <span class="text-on-background font-medium">{{ m.label }}</span>
            <span class="text-on-surface-variant font-mono">{{ m.used }} / {{ m.max }} {{ m.unit }}</span>
          </div>
          <div class="h-2 rounded-full bg-surface-container-high overflow-hidden">
            <div class="h-full rounded-full" [class]="pct(m) >= 90 ? 'bg-error' : 'bg-secondary'" [style.width.%]="pct(m)"></div>
          </div>
        </div>
      }

      <p class="text-sm text-on-surface-variant border-t border-outline-variant pt-4">
        Need more team members, clients or storage? Contact us to upgrade your plan.
      </p>
    </div>
  `,
})
export class PlanTabComponent {
  readonly me = input.required<TenantMeDto>();

  readonly meters = computed<Meter[]>(() => {
    const { plan, usage } = this.me();
    return [
      { label: 'Team members', used: usage.users, max: plan.maxUsers, unit: '' },
      { label: 'Clients', used: usage.clients, max: plan.maxClients, unit: '' },
      { label: 'Storage', used: usage.storageMb, max: plan.maxStorageMb, unit: 'MB' },
    ];
  });

  pct(m: Meter): number {
    return m.max > 0 ? Math.min(100, Math.round((m.used / m.max) * 100)) : 0;
  }
}
