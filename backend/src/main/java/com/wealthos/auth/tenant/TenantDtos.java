package com.wealthos.auth.tenant;

import java.time.Instant;

public final class TenantDtos {

    private TenantDtos() {
    }

    /** Public: what the login page needs to look like the distributor's own product. */
    public record BrandingDto(
            String slug,
            String name,
            String tagline,
            String logoUrl,
            String primaryColor,
            String secondaryColor,
            String supportEmail,
            String supportPhone,
            String arn) {

        static BrandingDto from(Tenant t) {
            return new BrandingDto(
                    t.getSlug(), t.getName(), t.getTagline(), t.getLogoDataUrl(), t.getPrimaryColor(), t.getSecondaryColor(),
                    t.getSupportEmail(), t.getSupportPhone(), t.getArn());
        }
    }

    public record PlanDto(String code, String name, int maxUsers, int maxClients, int maxStorageMb, int monthlyPriceInr) {

        static PlanDto from(Plan p) {
            return new PlanDto(p.getCode(), p.getName(), p.getMaxUsers(), p.getMaxClients(), p.getMaxStorageMb(), p.getMonthlyPriceInr());
        }
    }

    public record UsageDto(long users, long clients, long storageMb) {
    }

    public record TenantMeDto(BrandingDto branding, TenantStatus status, Instant trialEndsAt, PlanDto plan, UsageDto usage) {
    }

    public record TeamMemberDto(Long id, String role, String accountCode, String name, String email, String phone, boolean active, Instant createdAt) {
    }

    public record TenantSummaryDto(
            Long id, String slug, String name, TenantStatus status, String planCode, Instant trialEndsAt, long users, long clients, Instant createdAt) {
    }

    // ---- requests (every field optional unless the contract says otherwise; null = unchanged) ----

    public record UpdateBrandingRequest(
            String name,
            String tagline,
            String logoDataUrl,
            Boolean clearLogo,
            String primaryColor,
            String secondaryColor,
            String supportEmail,
            String supportPhone,
            String arn) {
    }

    public record AddMemberRequest(String role, String name, String email, String phone, String password) {
    }

    public record UpdateMemberRequest(Boolean active, String name, String phone) {
    }

    public record UpdatePlanRequest(String name, Integer maxUsers, Integer maxClients, Integer maxStorageMb, Integer monthlyPriceInr) {
    }

    public record CreateTenantRequest(
            String slug,
            String name,
            String planCode,
            Integer trialDays,
            String adminName,
            String adminEmail,
            String adminPassword,
            String primaryColor,
            String secondaryColor) {
    }

    public record UpdateTenantRequest(String name, String planCode, TenantStatus status, Instant trialEndsAt) {
    }

    public record PlatformLoginResponse(String accountCode, String name, String email, String token) {
    }
}
