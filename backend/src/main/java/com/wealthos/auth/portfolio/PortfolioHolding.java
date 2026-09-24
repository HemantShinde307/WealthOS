package com.wealthos.auth.portfolio;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * One scheme an investor holds, as of their last statement import or purchase (the baseline).
 * Live-NAV values and unrealised P/L are derived in the browser and are not stored. The table name
 * is deliberately distinctive: the shared wealthos_auth database already has another module's
 * "holdings" table that Hibernate's auto-update must never touch.
 */
@Entity
@Table(name = "investor_portfolio_holdings", indexes = @Index(name = "idx_investor_holdings_customer", columnList = "customer_id"))
public class PortfolioHolding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_id", nullable = false, length = 32)
    private String customerId;

    @Column(name = "scheme_id", nullable = false, length = 120)
    private String schemeId;

    @Column(name = "scheme_name", nullable = false, length = 300)
    private String schemeName;

    @Column(length = 12)
    private String isin;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(nullable = false, precision = 19, scale = 5)
    private BigDecimal units;

    @Column(name = "avg_cost", nullable = false, precision = 19, scale = 5)
    private BigDecimal avgCost;

    @Column(name = "current_nav", nullable = false, precision = 19, scale = 5)
    private BigDecimal currentNav;

    @Column(name = "current_value", nullable = false, precision = 19, scale = 4)
    private BigDecimal currentValue;

    @Column(name = "invested_value", nullable = false, precision = 19, scale = 4)
    private BigDecimal investedValue;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    protected PortfolioHolding() {
    }

    public PortfolioHolding(
            String customerId,
            String schemeId,
            String schemeName,
            String isin,
            String category,
            BigDecimal units,
            BigDecimal avgCost,
            BigDecimal currentNav,
            BigDecimal currentValue,
            BigDecimal investedValue) {
        this.customerId = customerId;
        this.schemeId = schemeId;
        this.schemeName = schemeName;
        this.isin = isin;
        this.category = category;
        this.units = units;
        this.avgCost = avgCost;
        this.currentNav = currentNav;
        this.currentValue = currentValue;
        this.investedValue = investedValue;
    }

    public Long getId() { return id; }
    public String getCustomerId() { return customerId; }
    public String getSchemeId() { return schemeId; }
    public String getSchemeName() { return schemeName; }
    public String getIsin() { return isin; }
    public String getCategory() { return category; }
    public BigDecimal getUnits() { return units; }
    public BigDecimal getAvgCost() { return avgCost; }
    public BigDecimal getCurrentNav() { return currentNav; }
    public BigDecimal getCurrentValue() { return currentValue; }
    public BigDecimal getInvestedValue() { return investedValue; }
}
