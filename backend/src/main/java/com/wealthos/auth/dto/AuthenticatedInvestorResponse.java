package com.wealthos.auth.dto;

import com.wealthos.auth.model.InvestorAccount;
import com.wealthos.auth.tenant.Tenant;

// Returned only by login/signup: the account plus the signed session token. Never includes the password hash.
public record AuthenticatedInvestorResponse(
        String customerId, String name, String email, String phone, String distributorCode, String token, String tenantSlug, String tenantName) {

    public static AuthenticatedInvestorResponse from(InvestorAccount account, String token, Tenant tenant) {
        return new AuthenticatedInvestorResponse(
                account.getCustomerId(), account.getName(), account.getEmail(), account.getPhone(), account.getDistributorCode(),
                token, tenant.getSlug(), tenant.getName());
    }
}
