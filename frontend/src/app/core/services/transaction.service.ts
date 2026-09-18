import { Injectable, signal } from '@angular/core';
import { Transaction } from '../models/domain.models';
import { MOCK_TRANSACTIONS } from '../mock-data';

let nextId = 98232;

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly _transactions = signal<Transaction[]>(MOCK_TRANSACTIONS);
  readonly transactions = this._transactions.asReadonly();

  add(txn: Omit<Transaction, 'id'>): Transaction {
    const created: Transaction = { ...txn, id: `TXN-${nextId++}` };
    this._transactions.update((list) => [created, ...list]);
    return created;
  }

  getById(id: string): Transaction | undefined {
    return this._transactions().find((t) => t.id === id);
  }

  recent(limit = 10): Transaction[] {
    return this._transactions().slice(0, limit);
  }
}
