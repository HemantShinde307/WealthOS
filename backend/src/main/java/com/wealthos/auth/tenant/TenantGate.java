package com.wealthos.auth.tenant;

import java.time.Clock;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Answers "may people of this firm use the API right now?" on every request, so suspending a firm
 * takes effect almost immediately. A short cache keeps this from adding a database read per request.
 */
@Component
public class TenantGate {

    static final long TTL_MILLIS = 30_000;

    private record Entry(boolean usable, long expiresAt) {
    }

    private final TenantRepository tenants;
    private final Clock clock;
    private final Map<Long, Entry> cache = new ConcurrentHashMap<>();

    @Autowired
    public TenantGate(TenantRepository tenants) {
        this(tenants, Clock.systemUTC());
    }

    TenantGate(TenantRepository tenants, Clock clock) {
        this.tenants = tenants;
        this.clock = clock;
    }

    public boolean isUsable(Long tenantId) {
        if (tenantId == null) {
            return false;
        }
        long now = clock.millis();
        Entry cached = cache.get(tenantId);
        if (cached != null && cached.expiresAt() > now) {
            return cached.usable();
        }
        boolean usable = tenants.findById(tenantId).map(t -> t.isUsableAt(clock.instant())).orElse(false);
        cache.put(tenantId, new Entry(usable, now + TTL_MILLIS));
        return usable;
    }

    /** Call after a status/plan change so it applies immediately on this server. */
    public void evict(Long tenantId) {
        if (tenantId != null) {
            cache.remove(tenantId);
        }
    }

    public Optional<Boolean> peek(Long tenantId) {
        Entry e = cache.get(tenantId);
        return e == null ? Optional.empty() : Optional.of(e.usable());
    }
}
