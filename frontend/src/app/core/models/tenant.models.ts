export interface BrandingDto {
  slug: string;
  name: string;
  tagline: string | null;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  supportEmail: string | null;
  supportPhone: string | null;
  arn: string | null;
}

export interface PlanDto {
  code: string;
  name: string;
  maxUsers: number;
  maxClients: number;
  maxStorageMb: number;
  monthlyPriceInr: number;
}

export type TenantStatus = 'TRIAL' | 'ACTIVE' | 'SUSPENDED';

export interface TenantMeDto {
  branding: BrandingDto;
  status: TenantStatus;
  trialEndsAt: string | null;
  plan: PlanDto;
  usage: { users: number; clients: number; storageMb: number };
}

export interface UpdateBrandingRequest {
  name?: string;
  tagline?: string;
  logoDataUrl?: string;
  clearLogo?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
  supportEmail?: string;
  supportPhone?: string;
  arn?: string;
}

export interface TeamMemberDto {
  id: number;
  role: 'admin' | 'advisor';
  accountCode: string;
  name: string;
  email: string;
  phone: string | null;
  active: boolean;
  createdAt: string;
}

export interface CreateTeamMemberRequest {
  role: 'admin' | 'advisor';
  name: string;
  email: string;
  phone?: string;
  password: string;
}

export interface TenantSummaryDto {
  id: number;
  slug: string;
  name: string;
  status: TenantStatus;
  planCode: string;
  trialEndsAt: string | null;
  users: number;
  clients: number;
  createdAt: string;
}

export interface CreateTenantRequest {
  slug: string;
  name: string;
  planCode: string;
  trialDays?: number;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  primaryColor?: string;
  secondaryColor?: string;
}
