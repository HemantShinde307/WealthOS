package com.wealthos.auth.nav;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.wealthos.auth.nav.AmfiNavParser.ParsedNav;
import com.wealthos.auth.nav.NavRefreshService.RefreshException;
import java.io.IOException;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;

class NavRefreshServiceTest {

    // 24 Sep 2026, 10:00 India time
    private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-09-24T04:30:00Z"), ZoneOffset.UTC);

    static class RecordingStore implements NavStore {
        final List<List<ParsedNav>> writes = new ArrayList<>();

        @Override
        public void upsertAll(List<ParsedNav> navs, Instant now) {
            writes.add(List.copyOf(navs));
        }
    }

    private static String file(int schemes, String date) {
        StringBuilder sb = new StringBuilder("Scheme Code;ISIN Div Payout/ ISIN Growth;ISIN Div Reinvestment;Scheme Name;Plan;Option;Net Asset Value;Date\n\nSome Mutual Fund\n");
        for (int i = 1; i <= schemes; i++) {
            sb.append(100000 + i).append(";INF000000011;-;Fund ").append(i).append(";Direct Plan;Growth;10.")
                    .append(i % 100).append(";").append(date).append("\n");
        }
        return sb.toString();
    }

    @Test
    void goodFileIsStoredAndReported() {
        RecordingStore store = new RecordingStore();
        NavRefreshService service = new NavRefreshService(() -> file(6000, "23-Sep-2026"), store, CLOCK);

        int stored = service.refresh();

        assertThat(stored).isEqualTo(6000);
        assertThat(store.writes).hasSize(1);
        assertThat(service.last().ok()).isTrue();
        assertThat(service.last().message()).contains("6000").contains("2026-09-23");
    }

    @Test
    void aTooSmallFileNeverOverwritesExistingData() {
        RecordingStore store = new RecordingStore();
        NavRefreshService service = new NavRefreshService(() -> file(20, "23-Sep-2026"), store, CLOCK);

        assertThatThrownBy(service::refresh).isInstanceOf(RefreshException.class).hasMessageContaining("incomplete");

        assertThat(store.writes).isEmpty();
        assertThat(service.last().ok()).isFalse();
    }

    @Test
    void anHtmlErrorPageIsRejected() {
        RecordingStore store = new RecordingStore();
        NavRefreshService service = new NavRefreshService(() -> "<html><body>Service unavailable</body></html>", store, CLOCK);

        assertThatThrownBy(service::refresh).isInstanceOf(RefreshException.class);

        assertThat(store.writes).isEmpty();
    }

    @Test
    void downloadFailureIsReportedAndStoresNothing() {
        RecordingStore store = new RecordingStore();
        NavRefreshService service = new NavRefreshService(() -> {
            throw new IOException("connection reset");
        }, store, CLOCK);

        assertThatThrownBy(service::refresh).isInstanceOf(RefreshException.class).hasMessageContaining("connection reset");

        assertThat(store.writes).isEmpty();
        assertThat(service.last().ok()).isFalse();
    }

    @Test
    void navsDatedInTheFutureAreDropped() {
        RecordingStore store = new RecordingStore();
        // 6000 valid rows plus a block dated far in the future
        String text = file(6000, "23-Sep-2026") + file(100, "01-Jan-2030").replaceAll("(?m)^1000", "2000");
        NavRefreshService service = new NavRefreshService(() -> text, store, CLOCK);

        service.refresh();

        assertThat(store.writes.get(0)).allMatch(n -> n.navDate().getYear() == 2026);
    }

    @Test
    void aFailingStoreIsReportedWithoutLeakingDetails() {
        NavStore broken = (navs, now) -> {
            throw new IllegalStateException("SQL error near password=secret");
        };
        NavRefreshService service = new NavRefreshService(() -> file(6000, "23-Sep-2026"), broken, CLOCK);

        assertThatThrownBy(service::refresh).isInstanceOf(RefreshException.class).hasMessageNotContaining("secret");

        assertThat(service.last().message()).doesNotContain("secret");
    }

    @Test
    void onlyOneRefreshRunsAtATime() throws Exception {
        CountDownLatch started = new CountDownLatch(1);
        CountDownLatch release = new CountDownLatch(1);
        NavRefreshService service = new NavRefreshService(() -> {
            started.countDown();
            try {
                release.await(5, TimeUnit.SECONDS);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            return file(6000, "23-Sep-2026");
        }, new RecordingStore(), CLOCK);

        Thread first = new Thread(service::refresh);
        first.start();
        assertThat(started.await(5, TimeUnit.SECONDS)).isTrue();

        assertThatThrownBy(service::refresh).isInstanceOf(RefreshException.class).hasMessageContaining("already running");

        release.countDown();
        first.join(5000);
        assertThat(service.last().ok()).isTrue();
    }
}
