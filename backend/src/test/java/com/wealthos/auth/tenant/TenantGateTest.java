package com.wealthos.auth.tenant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class TenantGateTest {

    private final TenantRepository tenants = mock(TenantRepository.class);

    private static Tenant firm(TenantStatus status, Instant trialEndsAt) {
        Tenant t = new Tenant("acme", "Acme", "STARTER");
        t.setStatus(status);
        t.setTrialEndsAt(trialEndsAt);
        return t;
    }

    @Test
    void activeFirmIsUsable() {
        when(tenants.findById(1L)).thenReturn(Optional.of(firm(TenantStatus.ACTIVE, null)));
        assertThat(new TenantGate(tenants).isUsable(1L)).isTrue();
    }

    @Test
    void suspendedFirmIsBlocked() {
        when(tenants.findById(1L)).thenReturn(Optional.of(firm(TenantStatus.SUSPENDED, null)));
        assertThat(new TenantGate(tenants).isUsable(1L)).isFalse();
    }

    @Test
    void expiredTrialIsBlockedButRunningTrialIsNot() {
        Instant now = Instant.parse("2026-09-25T00:00:00Z");
        Clock clock = Clock.fixed(now, ZoneOffset.UTC);
        when(tenants.findById(1L)).thenReturn(Optional.of(firm(TenantStatus.TRIAL, now.minusSeconds(60))));
        when(tenants.findById(2L)).thenReturn(Optional.of(firm(TenantStatus.TRIAL, now.plusSeconds(3600))));

        TenantGate gate = new TenantGate(tenants, clock);

        assertThat(gate.isUsable(1L)).isFalse();
        assertThat(gate.isUsable(2L)).isTrue();
    }

    @Test
    void unknownFirmOrMissingIdIsBlocked() {
        when(tenants.findById(any())).thenReturn(Optional.empty());
        TenantGate gate = new TenantGate(tenants);

        assertThat(gate.isUsable(99L)).isFalse();
        assertThat(gate.isUsable(null)).isFalse();
    }

    @Test
    void answerIsCachedUntilEvicted() {
        when(tenants.findById(1L)).thenReturn(Optional.of(firm(TenantStatus.ACTIVE, null)));
        TenantGate gate = new TenantGate(tenants);

        gate.isUsable(1L);
        gate.isUsable(1L);
        verify(tenants, times(1)).findById(1L);

        when(tenants.findById(1L)).thenReturn(Optional.of(firm(TenantStatus.SUSPENDED, null)));
        gate.evict(1L);
        assertThat(gate.isUsable(1L)).isFalse();
    }
}
