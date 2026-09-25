package com.wealthos.auth.dto;

import com.wealthos.auth.model.BaseAccount;
import com.wealthos.auth.tenant.Tenant;

// Returned only by the staff login endpoints: the account plus the signed session token.
public record AuthenticatedStaffResponse(String accountCode, String name, String email, String phone, String token, String tenantSlug, String tenantName) {

    public static AuthenticatedStaffResponse from(BaseAccount account, String token, Tenant tenant) {
        return new AuthenticatedStaffResponse(
                account.getAccountCode(), account.getName(), account.getEmail(), account.getPhone(), token, tenant.getSlug(), tenant.getName());
    }
}
