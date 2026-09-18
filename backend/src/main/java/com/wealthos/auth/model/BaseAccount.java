package com.wealthos.auth.model;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import java.time.Instant;

// Shared shape for the four staff-facing role account tables (advisor/admin/institutional/
// family office). InvestorAccount is kept separate and untouched since it was built first and
// already works end-to-end with the rest of the app — no need to risk it for a refactor.
@MappedSuperclass
public abstract class BaseAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "account_code", nullable = false, unique = true, length = 32)
    private String accountCode;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column
    private String phone;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected BaseAccount() {
    }

    protected BaseAccount(String accountCode, String name, String email, String passwordHash, String phone) {
        this.accountCode = accountCode;
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.phone = phone;
    }

    public Long getId() {
        return id;
    }

    public String getAccountCode() {
        return accountCode;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public String getPhone() {
        return phone;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
