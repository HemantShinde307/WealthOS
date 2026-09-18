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

  addClient(client: Client): void {
    this._clients.update((list) => [client, ...list]);
  }

  updateKycStatus(id: string, status: Client['kycStatus']): void {
    this._clients.update((list) => list.map((c) => (c.id === id ? { ...c, kycStatus: status } : c)));
  }
}
