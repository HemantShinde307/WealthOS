import { Injectable, signal } from '@angular/core';

export type UserRole = 'investor' | 'advisor' | 'admin' | 'institutional' | 'family_office';

export interface CurrentUser {
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

const DEFAULT_USER: CurrentUser = {
  name: 'Amit Deshmukh',
  email: 'amit.deshmukh@wealthos.com',
  role: 'advisor',
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly currentUser = signal<CurrentUser>(DEFAULT_USER);

  setRole(role: UserRole): void {
    this.currentUser.update((u) => ({ ...u, role }));
  }
}
