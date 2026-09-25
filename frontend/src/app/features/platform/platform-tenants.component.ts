import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { PlanDto, TenantStatus, TenantSummaryDto } from '../../core/models/tenant.models';
import { PlatformService, apiError } from '../../core/services/platform.service';
import { CreateTenantFormComponent } from './create-tenant-form.component';
import { PlansEditorComponent } from './plans-editor.component';

@Component({
  selector: 'app-platform-tenants',
  standalone: true,
  imports: [DatePipe, CreateTenantFormComponent, PlansEditorComponent],
  templateUrl: './platform-tenants.component.html',
})
export class PlatformTenantsComponent implements OnInit {
  private readonly api = inject(PlatformService);

  readonly tab = signal<'tenants' | 'plans'>('tenants');
  readonly tenants = signal<TenantSummaryDto[]>([]);
  readonly plans = signal<PlanDto[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly showCreate = signal(false);
  readonly busyId = signal<number | null>(null);

  // Portal address, derived from the host this console is served on (acme.<host>).
  private readonly host = location.host.replace(/^(www|app)\./, '');
  readonly statusClass: Record<TenantStatus, string> = {
    ACTIVE: 'bg-tertiary-fixed text-on-tertiary-fixed',
    TRIAL: 'bg-secondary-fixed text-on-secondary-fixed',
    SUSPENDED: 'bg-error-container text-on-error-container',
  };

  ngOnInit(): void {
    void this.reload();
  }

  async reload(): Promise<void> {
    this.loading.set(true);
    try {
      const [tenants, plans] = await Promise.all([firstValueFrom(this.api.tenants()), firstValueFrom(this.api.plans())]);
      this.tenants.set(tenants);
      this.plans.set(plans);
      this.error.set(null);
    } catch (err) {
      this.error.set(apiError(err, 'Could not load tenants.'));
    } finally {
      this.loading.set(false);
    }
  }

  portalAddress(t: TenantSummaryDto): string {
    return `${t.slug}.${this.host}`;
  }

  portalLink(t: TenantSummaryDto): string {
    return `${location.origin}/?tenant=${encodeURIComponent(t.slug)}`;
  }

  async changePlan(t: TenantSummaryDto, planCode: string): Promise<void> {
    await this.update(t, { planCode });
  }

  async toggleStatus(t: TenantSummaryDto): Promise<void> {
    const suspend = t.status !== 'SUSPENDED';
    if (suspend && !window.confirm(`Suspend ${t.name}? Its users will be unable to sign in.`)) return;
    await this.update(t, { status: suspend ? 'SUSPENDED' : 'ACTIVE' });
  }

  private async update(t: TenantSummaryDto, body: { planCode?: string; status?: string }): Promise<void> {
    this.busyId.set(t.id);
    this.error.set(null);
    try {
      const updated = await firstValueFrom(this.api.updateTenant(t.id, body));
      this.tenants.update((list) => list.map((x) => (x.id === updated.id ? updated : x)));
    } catch (err) {
      this.error.set(apiError(err));
      await this.reload();
    } finally {
      this.busyId.set(null);
    }
  }

  onCreated(t: TenantSummaryDto): void {
    this.tenants.update((list) => [t, ...list]);
    this.showCreate.set(false);
  }
}
