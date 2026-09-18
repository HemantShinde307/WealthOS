import { Injectable, signal } from '@angular/core';
import { CorporateEntity, MOCK_CORPORATE_ENTITIES } from '../institutional-data.mock';

// Tracks the entity currently being onboarded as the user moves between the
// entity-search -> structure-ubos -> document-vault -> review-queue steps.
// Local to the institutional onboarding flow; not shared with other modules.
@Injectable({ providedIn: 'root' })
export class OnboardingStateService {
  readonly selectedEntity = signal<CorporateEntity>(MOCK_CORPORATE_ENTITIES[0]);

  select(entity: CorporateEntity): void {
    this.selectedEntity.set(entity);
  }
}
