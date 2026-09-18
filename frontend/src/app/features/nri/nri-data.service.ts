import { Injectable, computed, inject } from '@angular/core';
import { ClientService } from '../../core/services/client.service';
import { Client } from '../../core/models/domain.models';
import {
  DTAA_TREATIES,
  NRI_LOCAL_CLIENTS,
  NRI_PROFILES,
  REGULATORY_UPDATES,
  REPATRIATION_ASSET_CLASSES,
  USD_INR_RATE,
} from './nri-data.mock';
import { NriClientProfile } from './nri-data.model';

export interface NriClientView {
  client: Client;
  profile: NriClientProfile;
}

/**
 * Feature-local service for the NRI module. Reuses `ClientService` for the one
 * NRI client already present in the shared mock data (Suresh Iyer, CL-1007)
 * and merges in a couple of local-only supplementary NRI clients + the
 * FEMA/FATCA/DTAA/repatriation profile data that has no home in the shared
 * domain model yet.
 */
@Injectable({ providedIn: 'root' })
export class NriDataService {
  private readonly clientService = inject(ClientService);

  readonly dtaaTreaties = DTAA_TREATIES;
  readonly assetClasses = REPATRIATION_ASSET_CLASSES;
  readonly regulatoryUpdates = REGULATORY_UPDATES;
  readonly usdInrRate = USD_INR_RATE;

  readonly nriClients = computed<Client[]>(() => [
    ...this.clientService.clients().filter((c) => c.segment === 'NRI'),
    ...NRI_LOCAL_CLIENTS,
  ]);

  readonly views = computed<NriClientView[]>(() =>
    this.nriClients()
      .map((client) => {
        const profile = NRI_PROFILES.find((p) => p.clientId === client.id);
        return profile ? { client, profile } : undefined;
      })
      .filter((v): v is NriClientView => !!v),
  );

  readonly totalAum = computed(() => this.views().reduce((sum, v) => sum + v.profile.aumNre + v.profile.aumNro, 0));

  readonly pendingComplianceCount = computed(() => this.views().filter((v) => v.profile.femaComplianceScore < 100).length);

  readonly pendingFatcaCount = computed(() => this.views().filter((v) => v.profile.fatcaCrsStatus === 'Pending').length);

  readonly countryBreakdown = computed(() => {
    const map = new Map<string, { country: string; flag: string; count: number; aum: number }>();
    for (const v of this.views()) {
      const key = v.profile.countryOfResidence;
      const existing = map.get(key);
      const aum = v.profile.aumNre + v.profile.aumNro;
      if (existing) {
        existing.count += 1;
        existing.aum += aum;
      } else {
        map.set(key, { country: key, flag: v.profile.countryFlag, count: 1, aum });
      }
    }
    return [...map.values()].sort((a, b) => b.aum - a.aum);
  });

  getView(clientId: string): NriClientView | undefined {
    return this.views().find((v) => v.client.id === clientId);
  }
}
