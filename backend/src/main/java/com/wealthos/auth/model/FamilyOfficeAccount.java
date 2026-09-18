package com.wealthos.auth.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "family_office_accounts")
public class FamilyOfficeAccount extends BaseAccount {

    protected FamilyOfficeAccount() {
        super();
    }

    public FamilyOfficeAccount(String accountCode, String name, String email, String passwordHash, String phone) {
        super(accountCode, name, email, passwordHash, phone);
    }
}
