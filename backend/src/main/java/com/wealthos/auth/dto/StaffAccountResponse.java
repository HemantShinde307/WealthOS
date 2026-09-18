package com.wealthos.auth.dto;

import com.wealthos.auth.model.BaseAccount;

// Response shape for the four staff-facing roles (advisor/admin/institutional/family office).
// Never includes the password hash.
public record StaffAccountResponse(String accountCode, String name, String email, String phone) {

    public static StaffAccountResponse from(BaseAccount account) {
        return new StaffAccountResponse(account.getAccountCode(), account.getName(), account.getEmail(), account.getPhone());
    }
}
