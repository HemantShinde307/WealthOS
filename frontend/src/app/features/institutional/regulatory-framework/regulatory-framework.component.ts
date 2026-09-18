import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MOCK_COMPLIANCE_STANDARDS, MOCK_REQUIRED_DOCUMENTS } from '../institutional-data.mock';

@Component({
  selector: 'app-regulatory-framework',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './regulatory-framework.component.html',
})
export class RegulatoryFrameworkComponent {
  readonly standards = MOCK_COMPLIANCE_STANDARDS;
  readonly requiredDocs = MOCK_REQUIRED_DOCUMENTS;

  readonly overallReadinessPct = 94;
  readonly pendingUbo = 12;
  readonly riskAlerts = 3;

  readonly riskLogicSnippet = `if (entity.country_of_incorporation != 'IN' ||
    entity.residency != 'IN') {
  rating = 'HIGH';
  trigger_edd();
} else if (entity.pep_status == true) {
  rating = 'HIGH';
  require_senior_management_approval();
} else {
  rating = calculate_base_risk(entity);
}`;
}
