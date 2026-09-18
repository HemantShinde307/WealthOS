import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KycService } from '../../../core/services/kyc.service';
import { AuditLogEntry } from '../../../core/models/domain.models';

// The shared AuditLogEntry model has no "module" field. We derive one from the
// action/entity text so the log can be filtered/grouped the way the mockup expects,
// without touching the shared domain model.
function moduleFor(entry: AuditLogEntry): string {
  const text = `${entry.action} ${entry.entity}`.toLowerCase();
  if (text.includes('login') || text.includes('logout') || text.includes('password')) return 'Auth';
  if (text.includes('kyc')) return 'KYC';
  if (text.includes('transaction') || text.includes('txn')) return 'Transactions';
  if (text.includes('report')) return 'Regulatory Reporting';
  if (text.includes('commission') || text.includes('slab')) return 'Settings';
  if (text.includes('document') || text.includes('vault')) return 'Document Vault';
  return 'Compliance Dashboard';
}

const PAGE_SIZE = 8;

@Component({
  selector: 'app-audit-trail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit-trail.component.html',
})
export class AuditTrailComponent {
  private readonly kycService = inject(KycService);

  readonly rawLog = this.kycService.auditLog;

  readonly enrichedLog = computed(() =>
    this.rawLog()
      .map((entry) => ({ ...entry, module: moduleFor(entry) }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
  );

  readonly modules = computed(() => ['All', ...Array.from(new Set(this.enrichedLog().map((e) => e.module))).sort()]);
  readonly actors = computed(() => ['All', ...Array.from(new Set(this.enrichedLog().map((e) => e.actor))).sort()]);

  readonly selectedModule = signal('All');
  readonly selectedActor = signal('All');
  readonly highRiskOnly = signal(false);
  readonly searchTerm = signal('');
  readonly page = signal(1);

  readonly filteredLog = computed(() => {
    const module = this.selectedModule();
    const actor = this.selectedActor();
    const highRisk = this.highRiskOnly();
    const term = this.searchTerm().trim().toLowerCase();

    return this.enrichedLog().filter((e) => {
      if (module !== 'All' && e.module !== module) return false;
      if (actor !== 'All' && e.actor !== actor) return false;
      if (highRisk && e.status !== 'Failure') return false;
      if (term && !(`${e.actor} ${e.action} ${e.entity}`.toLowerCase().includes(term))) return false;
      return true;
    });
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredLog().length / PAGE_SIZE)));

  readonly pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  readonly pagedLog = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.filteredLog().slice(start, start + PAGE_SIZE);
  });

  setModule(value: string): void {
    this.selectedModule.set(value);
    this.page.set(1);
  }

  setActor(value: string): void {
    this.selectedActor.set(value);
    this.page.set(1);
  }

  toggleHighRisk(): void {
    this.highRiskOnly.update((v) => !v);
    this.page.set(1);
  }

  setSearch(value: string): void {
    this.searchTerm.set(value);
    this.page.set(1);
  }

  clearFilters(): void {
    this.selectedModule.set('All');
    this.selectedActor.set('All');
    this.highRiskOnly.set(false);
    this.searchTerm.set('');
    this.page.set(1);
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
  }

  statusBadgeClass(status: string): string {
    return status === 'Success' ? 'bg-tertiary-fixed-dim/20 text-on-tertiary-fixed-variant' : 'bg-error-container text-on-error-container';
  }
}
