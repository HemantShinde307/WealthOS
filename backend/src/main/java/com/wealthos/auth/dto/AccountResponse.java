package com.wealthos.auth.dto;

import com.wealthos.auth.model.InvestorAccount;

// Never includes the password hash — this is what the frontend actually receives.
public record AccountResponse(String customerId, String name, String email, String phone) {

    public static AccountResponse from(InvestorAccount account) {
        return new AccountResponse(account.getCustomerId(), account.getName(), account.getEmail(), account.getPhone());
    }
}
