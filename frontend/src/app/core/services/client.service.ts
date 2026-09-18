import { Injectable, signal, computed } from '@angular/core';
import { Client } from '../models/domain.models';
import { MOCK_CLIENTS } from '../mock-data';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private readonly _clients = signal<Client[]>(MOCK_CLIENTS);
  readonly clients = this._clients.asReadonly();

  readonly totalAum = computed(() => this._clients().reduce((sum, c) => sum + c.aum, 0));

  getById(id: string): Client | undefined {
    return this._clients().find((c) => c.id === id);
  }

  /** Upserts by id — a self-service investor's record is added at signup and then filled in
   * further during onboarding (PAN, risk profile), so a second call for the same id must
   * replace rather than duplicate it. */
  addClient(client: Client): void {
    this._clients.update((list) => (list.some((c) => c.id === client.id) ? list.map((c) => (c.id === client.id ? client : c)) : [client, ...list]));
  }

  updateKycStatus(id: string, status: Client['kycStatus']): void {
    this._clients.update((list) => list.map((c) => (c.id === id ? { ...c, kycStatus: status } : c)));
  }
}
