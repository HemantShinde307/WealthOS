package com.wealthos.auth.chat;

import java.time.Duration;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/** Sliding-window limiter: at most {@code limit} actions per key within {@code window}. In-memory, per instance. */
public class RateLimiter {

    private final int limit;
    private final long windowMillis;
    private final Map<String, Deque<Long>> hits = new ConcurrentHashMap<>();

    public RateLimiter(int limit, Duration window) {
        this.limit = limit;
        this.windowMillis = window.toMillis();
    }

    public boolean tryAcquire(String key) {
        return tryAcquire(key, System.currentTimeMillis());
    }

    boolean tryAcquire(String key, long nowMillis) {
        Deque<Long> deque = hits.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (deque) {
            while (!deque.isEmpty() && nowMillis - deque.peekFirst() >= windowMillis) {
                deque.pollFirst();
            }
            if (deque.size() >= limit) {
                return false;
            }
            deque.addLast(nowMillis);
        }
        if (hits.size() > 10_000) {
            hits.entrySet().removeIf(e -> {
                synchronized (e.getValue()) {
                    return e.getValue().isEmpty() || nowMillis - e.getValue().peekLast() >= windowMillis;
                }
            });
        }
        return true;
    }
}
