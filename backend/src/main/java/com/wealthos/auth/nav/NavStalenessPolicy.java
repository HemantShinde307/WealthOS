package com.wealthos.auth.nav;

import com.wealthos.auth.nav.NavRefreshService.LastRefresh;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;

/**
 * Decides when NAVs need refreshing, so the store heals itself after the computer slept, the
 * server restarted, or AMFI was briefly unreachable. Pure logic (no clock, no I/O) so every rule
 * can be tested.
 *
 * AMFI publishes a business day's NAVs that evening. So at any time the newest NAV date we should
 * hold is the most recent weekday strictly before today (India time).
 */
final class NavStalenessPolicy {

    /** Nothing new after a successful check (a market holiday, say): don't hit AMFI again for a while. */
    static final Duration RETRY_AFTER_SUCCESS = Duration.ofHours(6);

    /** After a failed download, try again fairly soon. */
    static final Duration RETRY_AFTER_FAILURE = Duration.ofMinutes(30);

    private NavStalenessPolicy() {
    }

    /** The newest NAV date that should already be published, given today's date in India. */
    static LocalDate expectedLatestNavDate(LocalDate todayIndia) {
        LocalDate d = todayIndia.minusDays(1);
        while (d.getDayOfWeek() == DayOfWeek.SATURDAY || d.getDayOfWeek() == DayOfWeek.SUNDAY) {
            d = d.minusDays(1);
        }
        return d;
    }

    static boolean isUpToDate(LocalDate latestStored, LocalDate todayIndia) {
        return latestStored != null && !latestStored.isBefore(expectedLatestNavDate(todayIndia));
    }

    /**
     * @param latestStored newest NAV date in the store (null when empty)
     * @param last the previous refresh attempt in this run of the app, if any
     */
    static boolean shouldRefresh(LocalDate latestStored, LocalDate todayIndia, LastRefresh last, Instant now) {
        if (isUpToDate(latestStored, todayIndia)) {
            return false;
        }
        if (last == null) {
            return true;
        }
        Duration sinceLast = Duration.between(last.at(), now);
        return sinceLast.compareTo(last.ok() ? RETRY_AFTER_SUCCESS : RETRY_AFTER_FAILURE) >= 0;
    }
}
