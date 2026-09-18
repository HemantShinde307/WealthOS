import { Injectable, inject, signal } from '@angular/core';
import { InvestorAccountService } from './investor-account.service';
import { StaffAccountService, StaffRole } from './staff-account.service';

export type UserRole = 'investor' | 'advisor' | 'admin' | 'institutional' | 'family_office';

export interface CurrentUser {
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  /** Set for investor-role users — scopes PortfolioService/GoalService/TransactionService to this customer only. */
  customerId?: string;
  /** Set for the four staff-facing roles (advisor/admin/institutional/family office) — their own account identifier. */
  accountCode?: string;
}

export const ROLE_HOME_ROUTE: Record<UserRole, string> = {
  investor: '/investor/portfolio',
  advisor: '/advisor/dashboard',
  admin: '/admin/dashboard',
  institutional: '/institutional/global-dashboard',
  family_office: '/family-office/dashboard',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  investor: 'Investor',
  advisor: 'Advisor / Distributor',
  admin: 'Admin',
  institutional: 'Institutional',
  family_office: 'Family Office',
};

const SESSION_STORAGE_KEY = 'wealthos.session';

function loadPersistedSession(): CurrentUser | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CurrentUser) : null;
  } catch {
    return null;
  }
}

function persistSession(user: CurrentUser | null): void {
  try {
    if (user) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch {
    // Storage unavailable (private browsing, disabled cookies, etc.) — session just
    // won't survive a reload; the rest of the app functions normally either way.
  }
}

export interface LoginResult {
  success: boolean;
  error?: string;
}

const DEFAULT_USER: CurrentUser = { name: 'Amit Deshmukh', email: 'amit.deshmukh@wealthos.com', role: 'advisor' };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly investorAccounts = inject(InvestorAccountService);
  private readonly staffAccounts = inject(StaffAccountService);

  private readonly persisted = loadPersistedSession();
  readonly isAuthenticated = signal(this.persisted !== null);
  readonly currentUser = signal<CurrentUser>(this.persisted ?? DEFAULT_USER);

  async login(email: string, password: string, role: UserRole): Promise<LoginResult> {
    const trimmedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return { success: false, error: 'Enter a valid email address.' };
    }
    if (password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters.' };
    }

    // Every role is a real, registered account in its own dedicated MySQL table (see
    // InvestorAccountService / StaffAccountService) — an unknown email or wrong password is
    // rejected here for all five roles, not just investor.
    let user: CurrentUser;
    if (role === 'investor') {
      const account = await this.investorAccounts.validateCredentials(trimmedEmail, password);
      if (!account) {
        return { success: false, error: 'Invalid email or password.' };
      }
      user = { name: account.name, email: account.email, role, customerId: account.customerId };
    } else {
      const account = await this.staffAccounts.validateCredentials(role, trimmedEmail, password);
      if (!account) {
        return { success: false, error: 'Invalid email or password.' };
      }
      user = { name: account.name, email: account.email, role, accountCode: account.accountCode };
    }

    this.currentUser.set(user);
    this.isAuthenticated.set(true);
    persistSession(user);
    return { success: true };
  }

  async signup(details: { fullName: string; email: string; phone: string; password: string }): Promise<LoginResult> {
    if (details.fullName.trim().length < 2) return { success: false, error: 'Enter your full name.' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email.trim())) return { success: false, error: 'Enter a valid email address.' };
    if (details.password.length < 6) return { success: false, error: 'Password must be at least 6 characters.' };

    const result = await this.investorAccounts.createAccount(details);
    if (!result.success || !result.account) {
      return { success: false, error: result.error ?? 'Could not create your account. Please try again.' };
    }

    const user: CurrentUser = { name: result.account.name, email: result.account.email, role: 'investor', customerId: result.account.customerId };
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
    persistSession(user);
    return { success: true };
  }

  logout(): void {
    this.isAuthenticated.set(false);
    persistSession(null);
  }

  setRole(role: UserRole): void {
    this.currentUser.update((u) => {
      const next = { ...u, role };
      if (this.isAuthenticated()) persistSession(next);
      return next;
    });
  }
}
