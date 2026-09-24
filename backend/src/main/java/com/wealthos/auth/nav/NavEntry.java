package com.wealthos.auth.nav;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/**
 * Latest published NAV per scheme, refreshed daily from AMFI. The table name is deliberately
 * distinctive: the shared wealthos_auth database already has other modules' tables (for example
 * "manual_navs") that Hibernate's auto-update must never touch.
 */
@Entity
@Table(
        name = "amfi_nav_latest",
        indexes = {
            @Index(name = "idx_amfi_nav_isin", columnList = "isin_growth"),
            @Index(name = "idx_amfi_nav_isin_reinv", columnList = "isin_reinvestment")
        })
public class NavEntry {

    @Id
    @Column(name = "scheme_code")
    private Long schemeCode;

    @Column(name = "isin_growth", length = 12)
    private String isinGrowth;

    @Column(name = "isin_reinvestment", length = 12)
    private String isinReinvestment;

    @Column(name = "scheme_name", nullable = false, length = 300)
    private String schemeName;

    @Column(nullable = false, precision = 19, scale = 5)
    private BigDecimal nav;

    @Column(name = "nav_date", nullable = false)
    private LocalDate navDate;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected NavEntry() {
    }

    public Long getSchemeCode() { return schemeCode; }
    public String getIsinGrowth() { return isinGrowth; }
    public String getIsinReinvestment() { return isinReinvestment; }
    public String getSchemeName() { return schemeName; }
    public BigDecimal getNav() { return nav; }
    public LocalDate getNavDate() { return navDate; }
    public Instant getUpdatedAt() { return updatedAt; }
}
