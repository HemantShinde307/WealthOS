package com.wealthos.auth.tenant;

import java.util.Optional;

/** Plan limits that other modules (chat files, signup) enforce. An interface so they can be tested without a database. */
public interface TenantLimits {

    /** The firm's storage allowance in bytes, or empty when the firm/plan is unknown (no tenant limit applies). */
    Optional<Long> storageLimitBytes(Long tenantId);

    /** Total bytes of chat files currently stored by the firm. */
    long storageUsedBytes(Long tenantId);
}
