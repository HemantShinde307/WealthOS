package com.wealthos.auth.nav;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.concurrent.CompletableFuture;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

/**
 * Keeps NAVs fresh without anyone pressing a button. AMFI publishes each evening, so we look at
 * 21:30 and 23:30 India time, again at 07:30 as a safety net, and once after start-up when the
 * store is empty or stale. Every run is idempotent and safe to repeat.
 */
@Configuration
@EnableScheduling
@ConditionalOnProperty(name = "app.nav.enabled", havingValue = "true", matchIfMissing = true)
public class NavScheduler {

    private static final Logger log = LoggerFactory.getLogger(NavScheduler.class);
    private static final ZoneId INDIA = ZoneId.of("Asia/Kolkata");

    private final NavRefreshService refresh;
    private final NavEntryRepository repository;
    private final boolean refreshOnStartup;

    public NavScheduler(NavRefreshService refresh, NavEntryRepository repository, @Value("${app.nav.refresh-on-startup:true}") boolean refreshOnStartup) {
        this.refresh = refresh;
        this.repository = repository;
        this.refreshOnStartup = refreshOnStartup;
    }

    @Scheduled(cron = "0 30 7,21,23 * * *", zone = "Asia/Kolkata")
    public void scheduledRefresh() {
        run("scheduled");
    }

    @EventListener(ApplicationReadyEvent.class)
    public void refreshIfStaleOnStartup() {
        if (!refreshOnStartup) {
            return;
        }
        // Off the start-up thread: the app must come up even if AMFI is slow or unreachable.
        CompletableFuture.runAsync(() -> {
            try {
                LocalDate latest = repository.findLatestNavDate();
                if (latest == null || latest.isBefore(LocalDate.now(INDIA).minusDays(2))) {
                    run("start-up");
                }
            } catch (RuntimeException e) {
                log.warn("Start-up NAV check failed: {}", e.getMessage());
            }
        });
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
