package com.wealthos.auth.nav;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.concurrent.CompletableFuture;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

/**
 * Keeps NAVs fresh without anyone pressing a button.
 *
 * <ul>
 *   <li>Fixed daily runs (India time): 07:30, 10:30 (late AMC filings), 21:30 and 23:30 (same-day NAVs).
 *   <li>A catch-up check every 15 minutes and once at start-up: if the newest stored NAV date is behind
 *       what AMFI should have published by now, refresh. This is what recovers from a sleeping computer,
 *       a restart, or a failed download; scheduled times that pass while the app is not running are
 *       otherwise simply missed.
 * </ul>
 *
 * Every run is idempotent and never overwrites good data with a bad download.
 */
@Configuration
@EnableScheduling
@ConditionalOnProperty(name = "app.nav.enabled", havingValue = "true", matchIfMissing = true)
public class NavScheduler {

    private static final Logger log = LoggerFactory.getLogger(NavScheduler.class);
    private static final ZoneId INDIA = ZoneId.of("Asia/Kolkata");

    private final NavRefreshService refresh;
    private final NavEntryRepository repository;
    private final Clock clock;
    private final boolean refreshOnStartup;

    @Autowired
    public NavScheduler(NavRefreshService refresh, NavEntryRepository repository, @Value("${app.nav.refresh-on-startup:true}") boolean refreshOnStartup) {
        this(refresh, repository, Clock.systemUTC(), refreshOnStartup);
    }

    NavScheduler(NavRefreshService refresh, NavEntryRepository repository, Clock clock, boolean refreshOnStartup) {
        this.refresh = refresh;
        this.repository = repository;
        this.clock = clock;
        this.refreshOnStartup = refreshOnStartup;
    }

    @Scheduled(cron = "0 30 7,10,21,23 * * *", zone = "Asia/Kolkata")
    public void scheduledRefresh() {
        run("scheduled");
    }

    @Scheduled(
            fixedDelayString = "${app.nav.catch-up-interval-ms:900000}",
            initialDelayString = "${app.nav.catch-up-initial-delay-ms:60000}")
    public void catchUp() {
        try {
            LocalDate latest = repository.findLatestNavDate();
            LocalDate today = LocalDate.now(clock.withZone(INDIA));
            if (NavStalenessPolicy.shouldRefresh(latest, today, refresh.last(), clock.instant())) {
                log.info("NAVs are behind (newest stored {}, expected at least {}); refreshing", latest, NavStalenessPolicy.expectedLatestNavDate(today));
                run("catch-up");
            }
        } catch (RuntimeException e) {
            log.warn("NAV catch-up check failed: {}", e.getMessage());
        }
    }

    @EventListener(ApplicationReadyEvent.class)
    public void checkOnStartup() {
        if (!refreshOnStartup) {
            return;
        }
        // Off the start-up thread: the app must come up even if AMFI is slow or unreachable.
        CompletableFuture.runAsync(this::catchUp);
    }

    private void run(String reason) {
        try {
            int count = refresh.refresh();
            log.info("{} NAV refresh stored {} schemes", reason, count);
        } catch (RuntimeException e) {
            log.warn("{} NAV refresh did not complete: {}", reason, e.getMessage());
        }
    }
}
