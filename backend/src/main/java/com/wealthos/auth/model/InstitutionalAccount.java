package com.wealthos.auth.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "institutional_accounts")
public class InstitutionalAccount extends BaseAccount {

    protected InstitutionalAccount() {
        super();
    }

    public InstitutionalAccount(String accountCode, String name, String email, String passwordHash, String phone) {
        super(accountCode, name, email, passwordHash, phone);
    }
}
