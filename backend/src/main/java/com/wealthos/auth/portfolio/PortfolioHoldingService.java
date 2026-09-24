package com.wealthos.auth.portfolio;

import com.wealthos.auth.chat.RateLimiter;
import com.wealthos.auth.security.AuthPrincipal;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Stores an investor's own holdings. The customer is always the one in the verified token, so nobody
 * can read or overwrite another customer's portfolio, and every value is validated before it is saved.
 */
@Service
public class PortfolioHoldingService {

    static final int MAX_HOLDINGS = 500;
    private static final Pattern ISIN = Pattern.compile("^[A-Z0-9]{12}$");
    private static final BigDecimal LIMIT = new BigDecimal("10000000000000"); // 1e13
    private static final int MAX_PRECISION = 30;
    private static final int MAX_SCALE = 12;

    public static class PortfolioException extends RuntimeException {
        private final HttpStatus status;

        public PortfolioException(HttpStatus status, String message) {
            super(message);
            this.status = status;
        }

        public HttpStatus getStatus() {
            return status;
        }
    }

    private final PortfolioHoldingRepository repository;
    private final RateLimiter saveLimiter = new RateLimiter(20, Duration.ofMinutes(1));

    public PortfolioHoldingService(PortfolioHoldingRepository repository) {
        this.repository = repository;
    }

    public List<HoldingDto> list(AuthPrincipal principal) {
        String customerId = investorId(principal);
        return repository.findByCustomerIdOrderByIdAsc(customerId).stream().map(HoldingDto::from).toList();
    }

    @Transactional
    public List<HoldingDto> replace(AuthPrincipal principal, List<HoldingDto> incoming) {
        String customerId = investorId(principal);
        if (incoming == null) {
            throw bad("Send the holdings to save.");
        }
        if (incoming.size() > MAX_HOLDINGS) {
            throw bad("At most " + MAX_HOLDINGS + " holdings can be saved.");
        }
        // Validate everything first so a bad row never leaves the stored set half-replaced.
        List<PortfolioHolding> rows = new ArrayList<>(incoming.size());
        for (HoldingDto h : incoming) {
            rows.add(toEntity(customerId, h));
        }
        if (!saveLimiter.tryAcquire("save:" + customerId)) {
            throw new PortfolioException(HttpStatus.TOO_MANY_REQUESTS, "Saving too often. Please wait a moment.");
        }
        repository.deleteAllForCustomer(customerId);
        return repository.saveAll(rows).stream().map(HoldingDto::from).toList();
    }

    @Transactional
    public void clear(AuthPrincipal principal) {
        repository.deleteAllForCustomer(investorId(principal));
    }

    // ---- helpers -------------------------------------------------------------------------

    private static String investorId(AuthPrincipal principal) {
        if (!principal.isInvestor()) {
            throw new PortfolioException(HttpStatus.FORBIDDEN, "Portfolios belong to customers.");
        }
        return principal.code();
    }

    private static PortfolioHolding toEntity(String customerId, HoldingDto h) {
        if (h == null) {
            throw bad("A holding was empty.");
        }
        String schemeName = text(h.schemeName(), "scheme name", 300, true);
        String schemeId = text(h.schemeId(), "scheme id", 120, true);
        String category = text(h.category(), "category", 100, true);
        String isin = null;
        if (h.isin() != null && !h.isin().isBlank()) {
            isin = h.isin().trim();
            if (!ISIN.matcher(isin).matches()) {
                throw bad("Invalid ISIN for " + shorten(schemeName) + ".");
            }
        }
        return new PortfolioHolding(
                customerId, schemeId, schemeName, isin, category,
                amount(h.units(), "units", 5),
                amount(h.avgCost(), "average cost", 5),
                amount(h.currentNav(), "NAV", 5),
                amount(h.currentValue(), "current value", 4),
                amount(h.investedValue(), "invested value", 4));
    }

    private static String text(String value, String field, int max, boolean required) {
        String v = value == null ? "" : value.trim();
        if (required && v.isEmpty()) {
            throw bad("Missing " + field + ".");
        }
        if (v.length() > max) {
            throw bad("The " + field + " is too long.");
        }
        for (int i = 0; i < v.length(); i++) {
            if (Character.isISOControl(v.charAt(i))) {
                throw bad("The " + field + " contains characters that are not allowed.");
            }
        }
        return v;
    }

    /** Non-negative, bounded, and never asked to do arithmetic on an absurd exponent (e.g. 1e999999999). */
    private static BigDecimal amount(BigDecimal value, String field, int scale) {
        if (value == null) {
            throw bad("Missing " + field + ".");
        }
        if (value.scale() > MAX_SCALE || value.scale() < -2 || value.precision() > MAX_PRECISION) {
            throw bad("The " + field + " is out of range.");
        }
        if (value.signum() < 0 || value.compareTo(LIMIT) >= 0) {
            throw bad("The " + field + " is out of range.");
        }
        return value.setScale(scale, RoundingMode.HALF_UP);
    }

    private static PortfolioException bad(String message) {
        return new PortfolioException(HttpStatus.BAD_REQUEST, message);
    }

    private static String shorten(String s) {
        return s.length() > 40 ? s.substring(0, 40) + "..." : s;
    }
}
