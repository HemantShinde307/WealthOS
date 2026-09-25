import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { InvestorAccountService } from './investor-account.service';
import { StaffAccountService, StaffRole } from './staff-account.service';
import { TenantService } from './tenant.service';
import { PlatformService } from './platform.service';

export type UserRole = 'investor' | 'advisor' | 'admin' | 'institutional' | 'family_office' | 'platform_admin';

export interface CurrentUser {
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  /** Set for investor-role users — scopes PortfolioService/GoalService/TransactionService to this customer only. */
  customerId?: string;
  /** Set for the four staff-facing roles (advisor/admin/institutional/family office) — their own account identifier. */
  accountCode?: string;
  /** Investor only: the distributor (advisor accountCode) they are linked to, if any. */
  distributorCode?: string | null;
  /** Bearer token for the backend; persisted with the session and cleared on logout. */
  token?: string;
  /** Tenant (distributor firm) the session belongs to; absent for platform admins. */
  tenantSlug?: string;
  tenantName?: string;
}

export const ROLE_HOME_ROUTE: Record<UserRole, string> = {
  investor: '/investor/portfolio',
  advisor: '/advisor/dashboard',
  admin: '/admin/dashboard',
  institutional: '/institutional/global-dashboard',
  family_office: '/family-office/dashboard',
  platform_admin: '/platform/tenants',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  investor: 'Investor',
  advisor: 'Advisor / Distributor',
  admin: 'Admin',
  institutional: 'Institutional',
  family_office: 'Family Office',
  platform_admin: 'Platform Admin',
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

/** A session signed in on another tenant's portal must not be reused on this address — sign it out. */
function discardForeignTenantSession(user: CurrentUser | null, slug: string): CurrentUser | null {
  if (user && user.tenantSlug && user.tenantSlug !== slug) {
    persistSession(null);
    return null;
  }
  return user;
}

const DEFAULT_USER: CurrentUser = { name: 'Amit Deshmukh', email: 'amit.deshmukh@wealthos.com', role: 'advisor' };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly investorAccounts = inject(InvestorAccountService);
  private readonly staffAccounts = inject(StaffAccountService);
  private readonly tenant = inject(TenantService);
  private readonly platform = inject(PlatformService);

  private readonly persisted = discardForeignTenantSession(loadPersistedSession(), this.tenant.slug());
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
      const { account, error } = await this.investorAccounts.validateCredentials(trimmedEmail, password, this.tenant.slug());
      if (!account) {
        return { success: false, error: error ?? 'Invalid email or password.' };
      }
      user = { name: account.name, email: account.email, role, customerId: account.customerId, distributorCode: account.distributorCode ?? null, token: account.token, ...this.tenantOf(account) };
    } else {
      const { account, error } = await this.staffAccounts.validateCredentials(role as StaffRole, trimmedEmail, password, this.tenant.slug());
      if (!account) {
        return { success: false, error: error ?? 'Invalid email or password.' };
      }
      user = { name: account.name, email: account.email, role, accountCode: account.accountCode, token: account.token, ...this.tenantOf(account) };
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

    const result = await this.investorAccounts.createAccount({ ...details, tenant: this.tenant.slug() });
    if (!result.success || !result.account) {
      return { success: false, error: result.error ?? 'Could not create your account. Please try again.' };
    }

    const user: CurrentUser = { name: result.account.name, email: result.account.email, role: 'investor', customerId: result.account.customerId, distributorCode: result.account.distributorCode ?? null, token: result.account.token, ...this.tenantOf(result.account) };
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
    persistSession(user);
    return { success: true };
  }

  /** Platform-owner sign-in (no tenant). */
  async platformLogin(email: string, password: string): Promise<LoginResult> {
    try {
      const acc = await firstValueFrom(this.platform.login(email.trim(), password));
      const user: CurrentUser = { name: acc.name, email: acc.email, role: 'platform_admin', accountCode: acc.accountCode, token: acc.token };
      this.currentUser.set(user);
      this.isAuthenticated.set(true);
      persistSession(user);
      return { success: true };
    } catch (e) {
      const status = (e as { status?: number }).status;
      if (status === 401) return { success: false, error: 'Invalid email or password.' };
      if (status === 429) return { success: false, error: 'Too many attempts. Please wait a minute.' };
      if (status === 404) return { success: false, error: 'The server is running an older version. Restart the backend and try again.' };
      return { success: false, error: 'Cannot reach the server. Make sure the backend is running on port 8081.' };
    }
  }

  private tenantOf(account: { tenantSlug?: string; tenantName?: string }): Pick<CurrentUser, 'tenantSlug' | 'tenantName'> {
    return { tenantSlug: account.tenantSlug ?? this.tenant.slug(), tenantName: account.tenantName ?? this.tenant.brandName() };
  }

  /** Updates the investor's linked distributor in the current (persisted) session. */
  setDistributorCode(code: string | null): void {
    this.currentUser.update((u) => {
      const next = { ...u, distributorCode: code };
      if (this.isAuthenticated()) persistSession(next);
      return next;
    });
  }

  logout(): void {
    this.isAuthenticated.set(false);
    this.currentUser.update((u) => ({ ...u, token: undefined, distributorCode: undefined }));
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
