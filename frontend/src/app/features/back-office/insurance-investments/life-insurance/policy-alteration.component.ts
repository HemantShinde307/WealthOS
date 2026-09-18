import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LifeInsuranceService } from '../life-insurance.service';

@Component({
  selector: 'app-policy-alteration',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './policy-alteration.component.html',
})
export class PolicyAlterationComponent {
  readonly svc = inject(LifeInsuranceService);

  readonly selectedId = signal<string | null>(null);
  readonly sumAssured = signal<number | null>(null);
  readonly premium = signal<number | null>(null);
  readonly nominee = signal('');
  readonly saved = signal(false);

  readonly selectedPolicy = computed(() => {
    const id = this.selectedId();
    return id ? this.svc.getPolicy(id) : undefined;
  });

  selectPolicy(id: string): void {
    this.saved.set(false);
    this.selectedId.set(id || null);
    const p = id ? this.svc.getPolicy(id) : undefined;
    this.sumAssured.set(p?.sumAssured ?? null);
    this.premium.set(p?.premium ?? null);
    this.nominee.set(p?.nominee ?? '');
  }

  save(): void {
    const id = this.selectedId();
    if (!id || !this.sumAssured() || !this.premium()) return;
    this.svc.updatePolicy(id, { sumAssured: this.sumAssured()!, premium: this.premium()!, nominee: this.nominee().trim() || '—' });
    this.saved.set(true);
  }
}
