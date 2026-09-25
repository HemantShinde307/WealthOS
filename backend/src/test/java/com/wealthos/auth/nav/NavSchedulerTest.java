package com.wealthos.auth.nav;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.wealthos.auth.nav.NavRefreshService.LastRefresh;
import com.wealthos.auth.nav.NavRefreshService.RefreshException;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class NavSchedulerTest {

    private NavRefreshService refresh;
    private NavEntryRepository repository;

    // Wednesday 23 Sep 2026, 08:00 India time: the newest NAV we should hold is Tuesday 22 Sep.
    private static final Clock WED_MORNING = Clock.fixed(Instant.parse("2026-09-23T02:30:00Z"), ZoneOffset.UTC);

    @BeforeEach
    void setUp() {
        refresh = mock(NavRefreshService.class);
        repository = mock(NavEntryRepository.class);
    }

    private NavScheduler scheduler() {
        return new NavScheduler(refresh, repository, WED_MORNING, true);
    }

    @Test
    void refreshesWhenTheComputerSleptThroughTheNightAndTheStoreIsAdayBehind() {
        when(repository.findLatestNavDate()).thenReturn(LocalDate.of(2026, 9, 21)); // Monday
        when(refresh.last()).thenReturn(null);

        scheduler().catchUp();

        verify(refresh).refresh();
    }

    @Test
    void doesNothingWhenNavsAreAlreadyCurrent() {
        when(repository.findLatestNavDate()).thenReturn(LocalDate.of(2026, 9, 22)); // Tuesday

        scheduler().catchUp();

        verify(refresh, never()).refresh();
    }

    @Test
    void refreshesAnEmptyStore() {
        when(repository.findLatestNavDate()).thenReturn(null);

        scheduler().catchUp();

        verify(refresh).refresh();
    }

    @Test
    void doesNotRetryStraightAfterANothingNewResult() {
        when(repository.findLatestNavDate()).thenReturn(LocalDate.of(2026, 9, 21));
        when(refresh.last()).thenReturn(new LastRefresh(WED_MORNING.instant().minusSeconds(3600), true, "ok"));

        scheduler().catchUp();

        verify(refresh, never()).refresh();
    }

    @Test
    void aFailedDownloadNeverStopsTheSchedulerFromRunningAgain() {
        when(repository.findLatestNavDate()).thenReturn(LocalDate.of(2026, 9, 21));
        when(refresh.refresh()).thenThrow(new RefreshException("AMFI unreachable"));
        NavScheduler s = scheduler();

        s.catchUp();
        s.catchUp();

        verify(refresh, times(2)).refresh();
    }

    @Test
    void aBrokenDatabaseCheckIsSwallowedAndNothingIsRefreshed() {
        when(repository.findLatestNavDate()).thenThrow(new IllegalStateException("db down"));

        scheduler().catchUp();

        verify(refresh, never()).refresh();
    }

    @Test
    void theFixedDailyRunAlwaysRefreshes() {
        scheduler().scheduledRefresh();

        verify(refresh).refresh();
    }

    @Test
    void startupCheckIsSkippedWhenDisabled() {
        new NavScheduler(refresh, repository, WED_MORNING, false).checkOnStartup();

        verify(repository, never()).findLatestNavDate();
        verify(refresh, never()).last();
        verify(refresh, never()).refresh();
    }
}
