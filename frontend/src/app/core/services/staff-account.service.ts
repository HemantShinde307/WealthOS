import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

// Real backend — see c:\dev\wealthos-auth-service (Spring Boot + MySQL, database "wealthos_auth").
// Each of these four staff-facing roles has its OWN dedicated table (advisor_accounts,
// admin_accounts, institutional_accounts, family_office_accounts) and login endpoint, so a
// compromised or brute-forced advisor credential set has no bearing on any other role's accounts.
const API_BASE = `${environment.apiBase}/api/auth`;

export type StaffRole = 'advisor' | 'admin' | 'institutional' | 'family_office';

const ROLE_PATH: Record<StaffRole, string> = {
  advisor: 'advisor',
  admin: 'admin',
  institutional: 'institutional',
  family_office: 'family-office',
};

export interface StaffAccount {
  accountCode: string;
  name: string;
  email: string;
  phone: string;
  /** Signed JWT — present on login responses only. */
  token?: string;
}

@Injectable({ providedIn: 'root' })
export class StaffAccountService {
  private readonly http = inject(HttpClient);

  /** Returns the matching account only on a correct password — undefined for both an unknown email and a wrong password. */
  async validateCredentials(role: StaffRole, email: string, password: string): Promise<StaffAccount | undefined> {
    try {
      return await firstValueFrom(this.http.post<StaffAccount>(`${API_BASE}/${ROLE_PATH[role]}/login`, { email, password }));
    } catch {
      return undefined;
    }
  }
}
