package com.wealthos.auth.security;

/**
 * The authenticated caller, derived only from a verified token — never from request data.
 * {@code tenantId}/{@code tenantSlug} identify the distributor firm the caller belongs to; they are
 * null only for the platform administrator, who belongs to no firm.
 */
public record AuthPrincipal(String role, String code, String name, Long tenantId, String tenantSlug) {

    public static final String REQUEST_ATTRIBUTE = "wealthos.principal";
    public static final String PLATFORM_ADMIN = "platform_admin";

    /** For callers/tests that do not care about tenants. */
    public AuthPrincipal(String role, String code, String name) {
        this(role, code, name, null, null);
    }

    public boolean isAdvisor() {
        return "advisor".equals(role);
    }

    public boolean isInvestor() {
        return "investor".equals(role);
    }

    public boolean isTenantAdmin() {
        return "admin".equals(role);
    }

    public boolean isPlatformAdmin() {
        return PLATFORM_ADMIN.equals(role);
    }
}
