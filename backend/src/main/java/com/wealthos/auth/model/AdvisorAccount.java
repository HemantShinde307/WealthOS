package com.wealthos.auth.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "advisor_accounts")
public class AdvisorAccount extends BaseAccount {

    protected AdvisorAccount() {
        super();
    }

    public AdvisorAccount(String accountCode, String name, String email, String passwordHash, String phone) {
        super(accountCode, name, email, passwordHash, phone);
    }
}
