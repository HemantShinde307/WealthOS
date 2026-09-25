import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BrandingDto, CreateTeamMemberRequest, TeamMemberDto, TenantMeDto, UpdateBrandingRequest } from '../models/tenant.models';

const BASE = `${environment.apiBase}/api/tenant`;

/** Tenant-admin endpoints — always about the caller's own tenant. */
@Injectable({ providedIn: 'root' })
export class TenantAdminService {
  private readonly http = inject(HttpClient);

  me() {
    return this.http.get<TenantMeDto>(`${BASE}/me`);
  }
  updateBranding(body: UpdateBrandingRequest) {
    return this.http.put<BrandingDto>(`${BASE}/branding`, body);
  }
  users() {
    return this.http.get<TeamMemberDto[]>(`${BASE}/users`);
  }
  addUser(body: CreateTeamMemberRequest) {
    return this.http.post<TeamMemberDto>(`${BASE}/users`, body);
  }
  patchUser(role: string, id: number, body: { active?: boolean; name?: string; phone?: string }) {
    return this.http.patch<TeamMemberDto>(`${BASE}/users/${role}/${id}`, body);
  }
}
