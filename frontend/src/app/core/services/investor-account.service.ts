import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

// Real backend now — see c:\dev\wealthos-auth-service (Spring Boot + MySQL, database
// "wealthos_auth", table "investor_accounts"). Passwords are hashed with BCrypt server-side;
// this service never sees or stores a plaintext password beyond the login/signup request body.
const API_BASE = `${environment.apiBase}/api/auth`;

export interface InvestorAccount {
  customerId: string;
  name: string;
  email: string;
  phone: string;
  /** accountCode of the linked distributor, or null. */
  distributorCode?: string | null;
  /** Signed JWT — present on login/signup responses only. */
  token?: string;
  tenantSlug?: string;
  tenantName?: string;
}

export interface LoginOutcome<T> {
  account?: T;
  /** Only set when the server gave a specific reason (e.g. the portal is unavailable); otherwise generic invalid-credentials. */
  error?: string;
}

/** Only a 403 carries a message worth showing; a 401 must stay the generic "invalid credentials". */
export function loginFailure(err: unknown): string | undefined {
  if (err instanceof HttpErrorResponse && err.status === 403 && typeof err.error?.error === 'string') return err.error.error;
  return undefined;
}

export interface CreateAccountResult {
  success: boolean;
  account?: InvestorAccount;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class InvestorAccountService {
  private readonly http = inject(HttpClient);

  /** Returns the matching account only on a correct password — undefined for both an unknown email and a wrong password. */
  async validateCredentials(email: string, password: string, tenant: string): Promise<LoginOutcome<InvestorAccount>> {
    try {
      return { account: await firstValueFrom(this.http.post<InvestorAccount>(`${API_BASE}/login`, { email, password, tenant })) };
    } catch (err) {
      // 401 (bad credentials) or the backend being unreachable both surface as "invalid" to the caller.
      return { error: loginFailure(err) };
    }
  }

  async createAccount(details: { fullName: string; email: string; phone: string; password: string; tenant?: string }): Promise<CreateAccountResult> {
    try {
      const account = await firstValueFrom(this.http.post<InvestorAccount>(`${API_BASE}/signup`, details));
      return { success: true, account };
    } catch (err) {
      const message =
        err instanceof HttpErrorResponse && err.error?.error
          ? (err.error.error as string)
          : 'Could not reach the account service. Make sure the backend (auth-service) is running on port 8081.';
      return { success: false, error: message };
    }
  }

  async listAccounts(): Promise<InvestorAccount[]> {
    try {
      return await firstValueFrom(this.http.get<InvestorAccount[]>(`${API_BASE}/accounts`));
    } catch {
      return [];
    }
  }
}
