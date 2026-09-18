import { Injectable, signal } from '@angular/core';
import { Goal } from '../models/domain.models';
import { MOCK_GOALS } from '../mock-data';

let nextId = 7;

@Injectable({ providedIn: 'root' })
export class GoalService {
  private readonly _goals = signal<Goal[]>(MOCK_GOALS);
  readonly goals = this._goals.asReadonly();

  add(goal: Omit<Goal, 'id'>): Goal {
    const created: Goal = { ...goal, id: `GL-${String(nextId++).padStart(2, '0')}` };
    this._goals.update((list) => [created, ...list]);
    return created;
  }

  getById(id: string): Goal | undefined {
    return this._goals().find((g) => g.id === id);
  }
}
