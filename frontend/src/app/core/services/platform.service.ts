import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CreateTenantRequest, PlanDto, TenantSummaryDto } from '../models/tenant.models';

const BASE = `${environment.apiBase}/api/platform`;

export interface PlatformLoginResponse {
  accountCode: string;
  name: string;
  email: string;
  token: string;
}

/** Platform-owner endpoints (role platform_admin). */
@Injectable({ providedIn: 'root' })
export class PlatformService {
  private readonly http = inject(HttpClient);

  login(email: string, password: string) {
    return this.http.post<PlatformLoginResponse>(`${BASE}/login`, { email, password });
  }
  plans() {
    return this.http.get<PlanDto[]>(`${BASE}/plans`);
  }
  updatePlan(code: string, body: Partial<Omit<PlanDto, 'code'>>) {
    return this.http.put<PlanDto>(`${BASE}/plans/${encodeURIComponent(code)}`, body);
  }
  tenants() {
    return this.http.get<TenantSummaryDto[]>(`${BASE}/tenants`);
  }
  createTenant(body: CreateTenantRequest) {
    return this.http.post<TenantSummaryDto>(`${BASE}/tenants`, body);
  }
  updateTenant(id: number, body: { name?: string; planCode?: string; status?: string; trialEndsAt?: string }) {
    return this.http.put<TenantSummaryDto>(`${BASE}/tenants/${id}`, body);
  }
}

/** Pulls the backend's `{ error }` message out of a failed HTTP call. */
export function apiError(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (err instanceof HttpErrorResponse) {
    const msg = (err.error as { error?: unknown } | null)?.error;
    if (typeof msg === 'string' && msg) return msg;
    if (err.status === 0) return 'Could not reach the server.';
  }
  return fallback;
}
