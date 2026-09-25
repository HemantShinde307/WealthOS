package com.wealthos.auth.nav;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public final class NavDtos {

    private NavDtos() {
    }

    public record NavDto(long schemeCode, String isin, String isinReinvestment, String schemeName, BigDecimal nav, LocalDate navDate) {

        static NavDto from(NavEntry e) {
            return new NavDto(e.getSchemeCode(), e.getIsinGrowth(), e.getIsinReinvestment(), e.getSchemeName(), e.getNav(), e.getNavDate());
        }
    }

    public record NavStatusDto(
            long schemeCount,
            LocalDate latestNavDate,
            LocalDate expectedNavDate,
            boolean upToDate,
            Instant lastRefreshedAt,
            Boolean lastRefreshOk,
            String lastRefreshMessage) {
    }
}
