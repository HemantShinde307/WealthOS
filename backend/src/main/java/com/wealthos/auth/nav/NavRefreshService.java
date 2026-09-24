package com.wealthos.auth.nav;

import com.wealthos.auth.nav.AmfiNavParser.ParsedNav;
import java.io.IOException;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/** Downloads, checks and stores the AMFI NAV file. Never overwrites good data with a bad download. */
@Service
public class NavRefreshService {

    private static final Logger log = LoggerFactory.getLogger(NavRefreshService.class);

    /** The real file has ~14,000 schemes; far fewer means a truncated or wrong page. */
    static final int MIN_SCHEMES = 5000;

    private static final ZoneId INDIA = ZoneId.of("Asia/Kolkata");

    public record LastRefresh(Instant at, boolean ok, String message) {
    }

    public static class RefreshException extends RuntimeException {
        public RefreshException(String message) {
            super(message);
        }
    }

    private final NavSource source;
    private final NavStore store;
    private final Clock clock;
    private final AtomicBoolean running = new AtomicBoolean(false);
    private volatile LastRefresh last;

    @Autowired
    public NavRefreshService(NavSource source, NavStore store) {
        this(source, store, Clock.systemUTC());
    }

    NavRefreshService(NavSource source, NavStore store, Clock clock) {
        this.source = source;
        this.store = store;
        this.clock = clock;
    }

    public LastRefresh last() {
        return last;
    }

    /** @return how many schemes were written */
    public int refresh() {
        if (!running.compareAndSet(false, true)) {
            throw new RefreshException("A NAV refresh is already running.");
        }
        try {
            String text;
            try {
                text = source.download();
            } catch (IOException e) {
                throw new RefreshException("Could not download the AMFI NAV file: " + e.getMessage());
            }

            LocalDate latestAllowed = LocalDate.now(clock.withZone(INDIA)).plusDays(1);
            // A NAV dated in the future is bad data; drop those rows instead of trusting them.
            List<ParsedNav> navs = AmfiNavParser.parse(text).stream().filter(n -> !n.navDate().isAfter(latestAllowed)).toList();
            if (navs.size() < MIN_SCHEMES) {
                throw new RefreshException("AMFI file looked incomplete (" + navs.size() + " schemes); existing NAVs were kept.");
            }

            Instant now = clock.instant();
            store.upsertAll(navs, now);

            LocalDate newest = navs.stream().map(ParsedNav::navDate).max(LocalDate::compareTo).orElseThrow();
            last = new LastRefresh(now, true, "Updated " + navs.size() + " schemes; latest NAV date " + newest + ".");
            log.info("NAV refresh ok: {} schemes, latest NAV date {}", navs.size(), newest);
            return navs.size();
        } catch (RefreshException e) {
            last = new LastRefresh(clock.instant(), false, e.getMessage());
            log.warn("NAV refresh failed: {}", e.getMessage());
            throw e;
        } catch (RuntimeException e) {
            last = new LastRefresh(clock.instant(), false, "Unexpected error while updating NAVs.");
            log.error("NAV refresh crashed", e);
            throw new RefreshException("Unexpected error while updating NAVs.");
        } finally {
            running.set(false);
        }
    }
}
