import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { COMPLIANCE_REQUIREMENTS, JURISDICTIONS, REQUIRED_DOCUMENTS } from './regulatory-framework.mock';

@Component({
  selector: 'app-regulatory-framework',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './regulatory-framework.component.html',
})
export class RegulatoryFrameworkComponent {
  readonly jurisdictions = JURISDICTIONS;

  readonly selectedCode = signal(this.jurisdictions[0].code);

  readonly selectedJurisdiction = computed(() => this.jurisdictions.find((j) => j.code === this.selectedCode())!);

  readonly requirements = computed(() => COMPLIANCE_REQUIREMENTS.filter((r) => r.jurisdictionCode === this.selectedCode()));

  readonly documents = computed(() => REQUIRED_DOCUMENTS.filter((d) => d.jurisdictionCode === this.selectedCode()));

  readonly statusIcon: Record<string, string> = {
    met: 'check_circle',
    'active-rule': 'check_circle',
    'action-required': 'error',
  };
  readonly statusColor: Record<string, string> = {
    met: 'text-on-tertiary-container',
    'active-rule': 'text-on-tertiary-container',
    'action-required': 'text-error',
  };

  selectJurisdiction(code: string): void {
    this.selectedCode.set(code);
  }
}
