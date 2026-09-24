package com.wealthos.auth.chat;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import org.junit.jupiter.api.Test;

class RateLimiterTest {

    @Test
    void allowsUpToTheLimitThenBlocksWithinTheWindow() {
        RateLimiter limiter = new RateLimiter(3, Duration.ofSeconds(10));

        assertThat(limiter.tryAcquire("u", 0)).isTrue();
        assertThat(limiter.tryAcquire("u", 1_000)).isTrue();
        assertThat(limiter.tryAcquire("u", 2_000)).isTrue();
        assertThat(limiter.tryAcquire("u", 3_000)).isFalse();
    }

    @Test
    void allowsAgainOnceOldHitsFallOutOfTheWindow() {
        RateLimiter limiter = new RateLimiter(1, Duration.ofSeconds(10));

        assertThat(limiter.tryAcquire("u", 0)).isTrue();
        assertThat(limiter.tryAcquire("u", 9_999)).isFalse();
        assertThat(limiter.tryAcquire("u", 10_000)).isTrue();
    }

    @Test
    void keysAreIndependent() {
        RateLimiter limiter = new RateLimiter(1, Duration.ofSeconds(10));

        assertThat(limiter.tryAcquire("a", 0)).isTrue();
        assertThat(limiter.tryAcquire("b", 0)).isTrue();
        assertThat(limiter.tryAcquire("a", 1)).isFalse();
    }
}
