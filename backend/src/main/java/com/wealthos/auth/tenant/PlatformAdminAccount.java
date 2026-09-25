package com.wealthos.auth.tenant;

import com.wealthos.auth.model.BaseAccount;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/** The WealthOS owner's own account (manages tenants and plans). Belongs to no tenant. */
@Entity
@Table(name = "wealthos_platform_admins")
public class PlatformAdminAccount extends BaseAccount {

    protected PlatformAdminAccount() {
        super();
    }

    public PlatformAdminAccount(String accountCode, String name, String email, String passwordHash, String phone) {
        super(accountCode, name, email, passwordHash, phone);
    }
}
