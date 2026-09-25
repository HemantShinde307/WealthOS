import { Component, inject, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TenantMeDto } from '../../../core/models/tenant.models';
import { TenantAdminService } from '../../../core/services/tenant-admin.service';
import { apiError } from '../../../core/services/platform.service';
import { BrandingTabComponent } from './branding-tab.component';
import { TeamTabComponent } from './team-tab.component';
import { PlanTabComponent } from './plan-tab.component';

type Tab = 'branding' | 'team' | 'plan';

@Component({
  selector: 'app-organization',
  standalone: true,
  imports: [BrandingTabComponent, TeamTabComponent, PlanTabComponent],
  template: `
    <div>
      <h2 class="text-headline-lg-mobile md:text-headline-lg text-on-background">Organization</h2>
      <p class="text-body-md text-on-surface-variant mt-1">Branding, team and plan for your distributor portal.</p>
    </div>

    <div class="flex gap-1 border-b border-outline-variant">
      @for (t of tabs; track t.key) {
        <button
          class="px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors"
          [class]="tab() === t.key ? 'border-secondary text-secondary' : 'border-transparent text-on-surface-variant hover:text-on-background'"
          (click)="tab.set(t.key)"
        >
          {{ t.label }}
        </button>
      }
    </div>

    @if (error()) {
      <div class="bg-error-container/50 rounded-lg p-3 text-sm text-on-error-container">{{ error() }}</div>
    }

    @if (me(); as m) {
      @switch (tab()) {
        @case ('branding') {
          <app-branding-tab [branding]="m.branding" />
        }
        @case ('team') {
          <app-team-tab [maxUsers]="m.plan.maxUsers" />
        }
        @case ('plan') {
          <app-plan-tab [me]="m" />
        }
      }
    } @else if (!error()) {
      <p class="text-sm text-on-surface-variant">Loading…</p>
    }
  `,
})
export class OrganizationComponent implements OnInit {
  private readonly api = inject(TenantAdminService);

  readonly tabs: { key: Tab; label: string }[] = [
    { key: 'branding', label: 'Branding' },
    { key: 'team', label: 'Team' },
    { key: 'plan', label: 'Plan & usage' },
  ];
  readonly tab = signal<Tab>('branding');
  readonly me = signal<TenantMeDto | null>(null);
  readonly error = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    try {
      this.me.set(await firstValueFrom(this.api.me()));
    } catch (err) {
      this.error.set(apiError(err, 'Could not load your organization details.'));
    }
  }
}
