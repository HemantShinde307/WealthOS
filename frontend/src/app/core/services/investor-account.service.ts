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
  async validateCredentials(email: string, password: string): Promise<InvestorAccount | undefined> {
    try {
      return await firstValueFrom(this.http.post<InvestorAccount>(`${API_BASE}/login`, { email, password }));
    } catch {
      // 401 (bad credentials) or the backend being unreachable both surface as "invalid" to the caller.
      return undefined;
    }
  }

  async createAccount(details: { fullName: string; email: string; phone: string; password: string }): Promise<CreateAccountResult> {
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
