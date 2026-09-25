package com.wealthos.auth.nav;

import static org.assertj.core.api.Assertions.assertThat;

import com.wealthos.auth.nav.NavRefreshService.LastRefresh;
import java.time.Instant;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;

class NavStalenessPolicyTest {

    // 2026-09-21 is a Monday
    private static final LocalDate MON = LocalDate.of(2026, 9, 21);
    private static final LocalDate TUE = MON.plusDays(1);
    private static final LocalDate WED = MON.plusDays(2);
    private static final LocalDate FRI = MON.plusDays(4);
    private static final LocalDate SAT = MON.plusDays(5);
    private static final LocalDate SUN = MON.plusDays(6);
    private static final LocalDate NEXT_MON = MON.plusDays(7);

    private static final Instant NOW = Instant.parse("2026-09-24T05:00:00Z");

    private static LastRefresh ok(Instant at) {
        return new LastRefresh(at, true, "ok");
    }

    private static LastRefresh failed(Instant at) {
        return new LastRefresh(at, false, "AMFI unreachable");
    }

    // ---- which NAV date should we hold? ---------------------------------------------------

    @Test
    void expectedDateIsTheLastWeekdayBeforeToday() {
        assertThat(NavStalenessPolicy.expectedLatestNavDate(TUE)).isEqualTo(MON);
        assertThat(NavStalenessPolicy.expectedLatestNavDate(WED)).isEqualTo(TUE);
        assertThat(NavStalenessPolicy.expectedLatestNavDate(SAT)).isEqualTo(FRI);
    }

    @Test
    void overAWeekendTheExpectedDateStaysOnFriday() {
        assertThat(NavStalenessPolicy.expectedLatestNavDate(SUN)).isEqualTo(FRI);
        assertThat(NavStalenessPolicy.expectedLatestNavDate(NEXT_MON)).isEqualTo(FRI);
    }

    // ---- up to date? ---------------------------------------------------------------------

    @Test
    void anEmptyStoreIsNeverUpToDate() {
        assertThat(NavStalenessPolicy.isUpToDate(null, TUE)).isFalse();
    }

    @Test
    void holdingTheExpectedDateOrNewerIsUpToDate() {
        assertThat(NavStalenessPolicy.isUpToDate(MON, TUE)).isTrue();
        assertThat(NavStalenessPolicy.isUpToDate(TUE, TUE)).isTrue();
        assertThat(NavStalenessPolicy.isUpToDate(FRI, NEXT_MON)).isTrue();
        assertThat(NavStalenessPolicy.isUpToDate(SUN, NEXT_MON)).isTrue();
    }

    @Test
    void aDayBehindIsStale() {
        assertThat(NavStalenessPolicy.isUpToDate(MON, WED)).isFalse();
        assertThat(NavStalenessPolicy.isUpToDate(FRI.minusDays(1), NEXT_MON)).isFalse();
    }

    // ---- when to refresh -----------------------------------------------------------------

    @Test
    void neverRefreshesWhenAlreadyUpToDate() {
        assertThat(NavStalenessPolicy.shouldRefresh(MON, TUE, null, NOW)).isFalse();
        assertThat(NavStalenessPolicy.shouldRefresh(MON, TUE, failed(NOW.minusSeconds(86_400)), NOW)).isFalse();
    }

    @Test
    void refreshesImmediatelyWhenStaleAndNothingWasTriedYet() {
        // e.g. the computer slept overnight and the app has just woken up / restarted
        assertThat(NavStalenessPolicy.shouldRefresh(MON, WED, null, NOW)).isTrue();
        assertThat(NavStalenessPolicy.shouldRefresh(null, TUE, null, NOW)).isTrue();
    }

    @Test
    void afterAFailedDownloadItRetriesAfterHalfAnHour() {
        assertThat(NavStalenessPolicy.shouldRefresh(MON, WED, failed(NOW.minusSeconds(10 * 60)), NOW)).isFalse();
        assertThat(NavStalenessPolicy.shouldRefresh(MON, WED, failed(NOW.minusSeconds(31 * 60)), NOW)).isTrue();
    }

    @Test
    void whenACheckSucceededButThereWasNothingNewItDoesNotHammerAmfi() {
        // a market holiday: the data is "stale" by the calendar, but AMFI simply has nothing newer
        assertThat(NavStalenessPolicy.shouldRefresh(MON, WED, ok(NOW.minusSeconds(60 * 60)), NOW)).isFalse();
        assertThat(NavStalenessPolicy.shouldRefresh(MON, WED, ok(NOW.minusSeconds(5 * 3600)), NOW)).isFalse();
        assertThat(NavStalenessPolicy.shouldRefresh(MON, WED, ok(NOW.minusSeconds(6 * 3600 + 1)), NOW)).isTrue();
    }
}
