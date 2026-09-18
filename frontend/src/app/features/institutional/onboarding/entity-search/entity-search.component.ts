import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MOCK_REGISTRY_MATCHES, RegistryMatch, MOCK_CORPORATE_ENTITIES } from '../../institutional-data.mock';
import { OnboardingStateService } from '../onboarding-state.service';

@Component({
  selector: 'app-entity-search',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './entity-search.component.html',
})
export class EntitySearchComponent {
  private readonly router = inject(Router);
  private readonly onboarding = inject(OnboardingStateService);

  readonly query = signal('Meridian');
  readonly matches = signal<RegistryMatch[]>(MOCK_REGISTRY_MATCHES);
  readonly selectedMatch = signal<RegistryMatch>(MOCK_REGISTRY_MATCHES[0]);

  readonly selectedEntity = computed(() => MOCK_CORPORATE_ENTITIES.find((e) => e.id === this.selectedMatch().entityId) ?? MOCK_CORPORATE_ENTITIES[0]);

  select(match: RegistryMatch): void {
    this.selectedMatch.set(match);
  }

  beginOnboarding(): void {
    this.onboarding.select(this.selectedEntity());
    this.router.navigate(['/institutional/onboarding/structure-ubos']);
  }
}
