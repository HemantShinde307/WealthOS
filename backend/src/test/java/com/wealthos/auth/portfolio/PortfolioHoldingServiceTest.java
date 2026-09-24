package com.wealthos.auth.portfolio;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.wealthos.auth.portfolio.PortfolioHoldingService.PortfolioException;
import com.wealthos.auth.security.AuthPrincipal;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;

class PortfolioHoldingServiceTest {

    private PortfolioHoldingRepository repository;
    private PortfolioHoldingService service;

    private final AuthPrincipal ann = new AuthPrincipal("investor", "CL-1", "Ann");
    private final AuthPrincipal advisor = new AuthPrincipal("advisor", "ADV-1001", "Amit");

    @BeforeEach
    void setUp() {
        repository = mock(PortfolioHoldingRepository.class);
        service = new PortfolioHoldingService(repository);
        when(repository.saveAll(any())).thenAnswer(inv -> inv.getArgument(0));
    }

    private static HoldingDto holding() {
        return new HoldingDto("hdfc-flexi", "HDFC Flexi Cap Fund - Regular Growth", "INF179K01608", "Flexi Cap",
                new BigDecimal("12.164"), new BigDecimal("2055.14"), new BigDecimal("2041.965"), new BigDecimal("24838"), new BigDecimal("25000"));
    }

    private static HoldingDto with(String schemeName, String isin, String units) {
        return new HoldingDto("id", schemeName, isin, "Equity", new BigDecimal(units), BigDecimal.ONE, BigDecimal.ONE, BigDecimal.TEN, BigDecimal.TEN);
    }

    private void assertRejected(Runnable call, HttpStatus status) {
        assertThatThrownBy(call::run).isInstanceOfSatisfying(PortfolioException.class, e -> assertThat(e.getStatus()).isEqualTo(status));
    }

    // ---- who may use it ------------------------------------------------------------------

    @Test
    void onlyCustomersHavePortfolios() {
        assertRejected(() -> service.list(advisor), HttpStatus.FORBIDDEN);
        assertRejected(() -> service.replace(advisor, List.of(holding())), HttpStatus.FORBIDDEN);
        assertRejected(() -> service.clear(advisor), HttpStatus.FORBIDDEN);

        verify(repository, never()).deleteAllForCustomer(anyString());
    }

    @Test
    void listOnlyEverAsksForTheCallersOwnCustomerId() {
        service.list(ann);

        verify(repository).findByCustomerIdOrderByIdAsc("CL-1");
    }

    @Test
    void storedRowsAreAlwaysOwnedByTheTokenCustomer() {
        service.replace(ann, List.of(holding()));

        verify(repository).deleteAllForCustomer("CL-1");
        ArgumentCaptor<List<PortfolioHolding>> saved = ArgumentCaptor.forClass(List.class);
        verify(repository).saveAll(saved.capture());
        assertThat(saved.getValue()).hasSize(1).allMatch(h -> h.getCustomerId().equals("CL-1"));
    }

    @Test
    void clearRemovesOnlyTheCallersRows() {
        service.clear(ann);

        verify(repository).deleteAllForCustomer("CL-1");
    }

    // ---- validation: nothing is touched when input is bad ---------------------------------

    @Test
    void invalidInputIsRejectedBeforeAnyStoredDataIsDeleted() {
        assertRejected(() -> service.replace(ann, null), HttpStatus.BAD_REQUEST);
        assertRejected(() -> service.replace(ann, Collections.singletonList(null)), HttpStatus.BAD_REQUEST);
        assertRejected(() -> service.replace(ann, List.of(with("  ", "INF179K01608", "1"))), HttpStatus.BAD_REQUEST);
        assertRejected(() -> service.replace(ann, List.of(with("X".repeat(301), null, "1"))), HttpStatus.BAD_REQUEST);
        assertRejected(() -> service.replace(ann, List.of(with("bad\u0000name", null, "1"))), HttpStatus.BAD_REQUEST);
        assertRejected(() -> service.replace(ann, List.of(with("Fund", "not-an-isin", "1"))), HttpStatus.BAD_REQUEST);
        assertRejected(() -> service.replace(ann, List.of(with("Fund", null, "-1"))), HttpStatus.BAD_REQUEST);
        assertRejected(() -> service.replace(ann, List.of(with("Fund", null, "10000000000000"))), HttpStatus.BAD_REQUEST);
        assertRejected(() -> service.replace(ann, List.of(with("Fund", null, "0.1234567890123"))), HttpStatus.BAD_REQUEST);

        verify(repository, never()).deleteAllForCustomer(anyString());
        verify(repository, never()).saveAll(any());
    }

    @Test
    void absurdExponentsCannotStallTheServer() {
        // BigDecimal("1E+999999999") is legal JSON; doing arithmetic on it would burn CPU and memory.
        assertRejected(() -> service.replace(ann, List.of(with("Fund", null, "1E+999999999"))), HttpStatus.BAD_REQUEST);
        assertRejected(() -> service.replace(ann, List.of(with("Fund", null, "1E-999999999"))), HttpStatus.BAD_REQUEST);
        assertRejected(() -> service.replace(ann, List.of(with("Fund", null, "1".repeat(40)))), HttpStatus.BAD_REQUEST);
    }

    @Test
    void oneBadRowAmongGoodOnesRejectsTheWholeSave() {
        List<HoldingDto> mixed = new ArrayList<>(List.of(holding(), holding(), with("Fund", "bad", "1")));

        assertRejected(() -> service.replace(ann, mixed), HttpStatus.BAD_REQUEST);

        verify(repository, never()).deleteAllForCustomer(anyString());
    }

    @Test
    void tooManyHoldingsAreRejected() {
        List<HoldingDto> many = Collections.nCopies(501, holding());

        assertRejected(() -> service.replace(ann, many), HttpStatus.BAD_REQUEST);
    }

    @Test
    void theMaximumAndAnEmptyListAreAllowed() {
        assertThat(service.replace(ann, Collections.nCopies(500, holding()))).hasSize(500);
        assertThat(service.replace(ann, List.of())).isEmpty();
    }

    // ---- normalisation ------------------------------------------------------------------

    @Test
    void blankIsinBecomesNullAndNumbersAreRounded() {
        HoldingDto in = new HoldingDto("id", "  Some Fund  ", "  ", "Debt",
                new BigDecimal("1.1234567"), new BigDecimal("2"), new BigDecimal("3.123456"), new BigDecimal("4.12345"), new BigDecimal("5"));

        HoldingDto out = service.replace(ann, List.of(in)).get(0);

        assertThat(out.isin()).isNull();
        assertThat(out.schemeName()).isEqualTo("Some Fund");
        assertThat(out.units()).isEqualByComparingTo("1.12346");
        assertThat(out.currentNav()).isEqualByComparingTo("3.12346");
        assertThat(out.currentValue()).isEqualByComparingTo("4.1235");
    }

    @Test
    void savingTooOftenIsThrottled() {
        for (int i = 0; i < 20; i++) {
            service.replace(ann, List.of(holding()));
        }

        assertRejected(() -> service.replace(ann, List.of(holding())), HttpStatus.TOO_MANY_REQUESTS);
    }

    @Test
    void anotherCustomersThrottleIsIndependent() {
        for (int i = 0; i < 20; i++) {
            service.replace(ann, List.of(holding()));
        }

        assertThat(service.replace(new AuthPrincipal("investor", "CL-2", "Bob"), List.of(holding()))).hasSize(1);
    }
}
