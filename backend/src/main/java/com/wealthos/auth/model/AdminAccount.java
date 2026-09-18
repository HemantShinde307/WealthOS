package com.wealthos.auth.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "admin_accounts")
public class AdminAccount extends BaseAccount {

    protected AdminAccount() {
        super();
    }

    public AdminAccount(String accountCode, String name, String email, String passwordHash, String phone) {
        super(accountCode, name, email, passwordHash, phone);
    }
}
