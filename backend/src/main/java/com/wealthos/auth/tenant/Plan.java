package com.wealthos.auth.tenant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A subscription plan and the limits it grants. The table name is distinctive because the database is shared with other modules. */
@Entity
@Table(name = "wealthos_plans")
public class Plan {

    @Id
    @Column(length = 20)
    private String code;

    @Column(nullable = false, length = 60)
    private String name;

    @Column(name = "max_users", nullable = false)
    private int maxUsers;

    @Column(name = "max_clients", nullable = false)
    private int maxClients;

    @Column(name = "max_storage_mb", nullable = false)
    private int maxStorageMb;

    @Column(name = "monthly_price_inr", nullable = false)
    private int monthlyPriceInr;

    protected Plan() {
    }

    public Plan(String code, String name, int maxUsers, int maxClients, int maxStorageMb, int monthlyPriceInr) {
        this.code = code;
        this.name = name;
        this.maxUsers = maxUsers;
        this.maxClients = maxClients;
        this.maxStorageMb = maxStorageMb;
        this.monthlyPriceInr = monthlyPriceInr;
    }

    public String getCode() { return code; }
    public String getName() { return name; }
    public int getMaxUsers() { return maxUsers; }
    public int getMaxClients() { return maxClients; }
    public int getMaxStorageMb() { return maxStorageMb; }
    public int getMonthlyPriceInr() { return monthlyPriceInr; }

    public void setName(String name) { this.name = name; }
    public void setMaxUsers(int maxUsers) { this.maxUsers = maxUsers; }
    public void setMaxClients(int maxClients) { this.maxClients = maxClients; }
    public void setMaxStorageMb(int maxStorageMb) { this.maxStorageMb = maxStorageMb; }
    public void setMonthlyPriceInr(int monthlyPriceInr) { this.monthlyPriceInr = monthlyPriceInr; }
}
