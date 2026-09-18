import { Injectable, signal } from '@angular/core';
import { Campaign, InsurancePolicy } from '../models/domain.models';
import { MOCK_CAMPAIGNS, MOCK_INSURANCE_POLICIES } from '../mock-data/campaigns.mock';

@Injectable({ providedIn: 'root' })
export class CampaignService {
  private readonly _campaigns = signal<Campaign[]>(MOCK_CAMPAIGNS);
  readonly campaigns = this._campaigns.asReadonly();

  private readonly _policies = signal<InsurancePolicy[]>(MOCK_INSURANCE_POLICIES);
  readonly policies = this._policies.asReadonly();
}
