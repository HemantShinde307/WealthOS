package com.wealthos.auth.nav;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.wealthos.auth.nav.NavDtos.NavDto;
import com.wealthos.auth.nav.NavService.NavException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

class NavServiceTest {

    private NavEntryRepository repository;
    private NavRefreshService refresh;
    private NavService service;

    @BeforeEach
    void setUp() {
        repository = mock(NavEntryRepository.class);
        refresh = mock(NavRefreshService.class);
        service = new NavService(repository, refresh);
    }

    private static NavEntry entry(long code, String isin, String reinvestIsin, String nav) {
        NavEntry e = mock(NavEntry.class);
        when(e.getSchemeCode()).thenReturn(code);
        when(e.getIsinGrowth()).thenReturn(isin);
        when(e.getIsinReinvestment()).thenReturn(reinvestIsin);
        when(e.getSchemeName()).thenReturn("Fund " + code);
        when(e.getNav()).thenReturn(new BigDecimal(nav));
        when(e.getNavDate()).thenReturn(LocalDate.of(2026, 9, 23));
        return e;
    }

    private void assertBadRequest(Runnable call) {
        assertThatThrownBy(call::run).isInstanceOfSatisfying(NavException.class, e -> assertThat(e.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST));
    }

    @Test
    void looksUpByIsinAndCodeAndMergesWithoutDuplicates() {
        NavEntry flexi = entry(101762, "INF179K01608", "INF179K01616", "2042.755");
        NavEntry mid = entry(118989, "INF179K01XQ0", null, "231.07");
        when(repository.findByIsinGrowthIn(any())).thenReturn(List.of(flexi));
        when(repository.findByIsinReinvestmentIn(any())).thenReturn(List.of(flexi));
        when(repository.findBySchemeCodeIn(any())).thenReturn(List.of(flexi, mid));

        List<NavDto> result = service.latest("inf179k01608", "101762,118989");

        assertThat(result).extracting(NavDto::schemeCode).containsExactly(101762L, 118989L);
        assertThat(result.get(0).nav()).isEqualByComparingTo("2042.755");
        assertThat(result.get(0).isin()).isEqualTo("INF179K01608");
    }

    @Test
    void isinsAreUpperCasedAndTrimmedBeforeTheLookup() {
        when(repository.findByIsinGrowthIn(any())).thenReturn(List.of());
        when(repository.findByIsinReinvestmentIn(any())).thenReturn(List.of());

        service.latest(" inf179k01608 , ,INF209K01363", null);

        verify(repository).findByIsinGrowthIn(Set.of("INF179K01608", "INF209K01363"));
    }

    @Test
    void unknownIdsJustComeBackEmpty() {
        when(repository.findBySchemeCodeIn(any())).thenReturn(List.of());

        assertThat(service.latest(null, "999999")).isEmpty();
    }

    @Test
    void badInputIsRejectedBeforeAnyQuery() {
        assertBadRequest(() -> service.latest("NOTANISIN", null));
        assertBadRequest(() -> service.latest("INF179K01608'; DROP TABLE x;--", null));
        assertBadRequest(() -> service.latest(null, "12ab"));
        assertBadRequest(() -> service.latest(null, "1234567890123"));
        assertBadRequest(() -> service.latest(null, null));
        assertBadRequest(() -> service.latest("", "  "));

        verify(repository, never()).findByIsinGrowthIn(any());
        verify(repository, never()).findBySchemeCodeIn(any());
    }

    @Test
    void tooManyIdsAreRejected() {
        String codes = IntStream.rangeClosed(1, 201).mapToObj(Integer::toString).collect(Collectors.joining(","));

        assertBadRequest(() -> service.latest(null, codes));
    }

    @Test
    void exactlyTheMaximumIsAllowed() {
        when(repository.findBySchemeCodeIn(any())).thenReturn(List.of());
        String codes = IntStream.rangeClosed(1, 200).mapToObj(Integer::toString).collect(Collectors.joining(","));

        assertThat(service.latest(null, codes)).isEmpty();
    }

    @Test
    void errorMessagesNeverEchoDangerousInput() {
        assertThatThrownBy(() -> service.latest("<script>alert(1)</script>", null))
                .isInstanceOfSatisfying(NavException.class, e -> assertThat(e.getMessage()).doesNotContain("<").doesNotContain(">"));
    }

    @Test
    void statusReportsTheStoreAndTheLastRefresh() {
        when(repository.count()).thenReturn(14000L);
        when(repository.findLatestNavDate()).thenReturn(LocalDate.of(2026, 9, 23));
        when(refresh.last()).thenReturn(new NavRefreshService.LastRefresh(java.time.Instant.parse("2026-09-24T05:00:00Z"), true, "Updated 14000 schemes"));

        var status = service.status();

        assertThat(status.schemeCount()).isEqualTo(14000);
        assertThat(status.latestNavDate()).isEqualTo(LocalDate.of(2026, 9, 23));
        assertThat(status.lastRefreshOk()).isTrue();
    }

    @Test
    void statusBeforeAnyRefreshFallsBackToTheStore() {
        when(repository.count()).thenReturn(0L);
        when(refresh.last()).thenReturn(null);

        var status = service.status();

        assertThat(status.lastRefreshOk()).isNull();
        assertThat(status.lastRefreshMessage()).isNull();
    }
}
