package com.wealthos.auth.portfolio;

import java.math.BigDecimal;
import java.util.List;

public record HoldingDto(
        String schemeId,
        String schemeName,
        String isin,
        String category,
        BigDecimal units,
        BigDecimal avgCost,
        BigDecimal currentNav,
        BigDecimal currentValue,
        BigDecimal investedValue) {

    static HoldingDto from(PortfolioHolding h) {
        return new HoldingDto(
                h.getSchemeId(), h.getSchemeName(), h.getIsin(), h.getCategory(),
                h.getUnits(), h.getAvgCost(), h.getCurrentNav(), h.getCurrentValue(), h.getInvestedValue());
    }

    public record ReplaceRequest(List<HoldingDto> holdings) {
    }
}
