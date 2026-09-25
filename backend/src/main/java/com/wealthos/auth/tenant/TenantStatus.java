package com.wealthos.auth.tenant;

public enum TenantStatus {
    /** Free trial: usable until {@code trialEndsAt}. */
    TRIAL,
    ACTIVE,
    /** Blocked by the platform administrator (for example unpaid); nobody of the firm can sign in or use the API. */
    SUSPENDED
}
