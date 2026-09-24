package com.wealthos.auth.chat;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.wealthos.auth.model.AdvisorAccount;
import com.wealthos.auth.model.InvestorAccount;
import com.wealthos.auth.repository.AdvisorAccountRepository;
import com.wealthos.auth.repository.InvestorAccountRepository;
import com.wealthos.auth.security.AuthPrincipal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;
import tools.jackson.databind.json.JsonMapper;

class ChatServiceTest {

    private ChatMessageRepository messages;
    private InvestorAccountRepository investors;
    private AdvisorAccountRepository advisors;
    private ChatSessionRegistry registry;
    private ChatService service;

    private final AuthPrincipal advisor = new AuthPrincipal("advisor", "ADV-1001", "Amit");
    private final AuthPrincipal otherAdvisor = new AuthPrincipal("advisor", "ADV-2002", "Other");
    private final AuthPrincipal investor = new AuthPrincipal("investor", "CL-1", "Ann");
    private final AuthPrincipal admin = new AuthPrincipal("admin", "ADM-1", "Admin");

    @BeforeEach
    void setUp() {
        messages = mock(ChatMessageRepository.class);
        investors = mock(InvestorAccountRepository.class);
        advisors = mock(AdvisorAccountRepository.class);
        registry = mock(ChatSessionRegistry.class);
        service = new ChatService(messages, investors, advisors, registry, JsonMapper.builder().build());

        InvestorAccount linked = new InvestorAccount("CL-1", "Ann", "ann@example.com", "hash", null);
        linked.setDistributorCode("ADV-1001");
        InvestorAccount unlinked = new InvestorAccount("CL-2", "Bob", "bob@example.com", "hash", null);
        when(investors.findByCustomerId("CL-1")).thenReturn(Optional.of(linked));
        when(investors.findByCustomerId("CL-2")).thenReturn(Optional.of(unlinked));
        when(advisors.findByAccountCode("ADV-1001")).thenReturn(Optional.of(new AdvisorAccount("ADV-1001", "Amit", "a@x.com", "hash", null)));
        when(messages.save(any(ChatMessage.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    private void assertRejected(Runnable action, HttpStatus status) {
        assertThatThrownBy(action::run).isInstanceOfSatisfying(ChatException.class, e -> assertThat(e.getStatus()).isEqualTo(status));
    }

    // ---- who may talk to whom ------------------------------------------------------------

    @Test
    void advisorCanUseTheirOwnCustomer() {
        ChatService.Conversation conv = service.resolve(advisor, "CL-1");

        assertThat(conv.advisorCode()).isEqualTo("ADV-1001");
        assertThat(conv.customerId()).isEqualTo("CL-1");
        assertThat(conv.self()).isEqualTo(ChatSenderRole.ADVISOR);
    }

    @Test
    void advisorCannotUseSomeoneElsesCustomer() {
        assertRejected(() -> service.resolve(otherAdvisor, "CL-1"), HttpStatus.FORBIDDEN);
    }

    @Test
    void advisorCannotUseACustomerWithNoDistributor() {
        assertRejected(() -> service.resolve(advisor, "CL-2"), HttpStatus.FORBIDDEN);
    }

    @Test
    void unknownCustomerLooksTheSameAsSomeoneElsesCustomer() {
        when(investors.findByCustomerId("NOPE")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.resolve(advisor, "NOPE"))
                .isInstanceOfSatisfying(ChatException.class, e -> {
                    assertThat(e.getStatus()).isEqualTo(HttpStatus.FORBIDDEN);
                    assertThat(e.getMessage()).isEqualTo("This customer is not connected to you.");
                });
    }

    @Test
    void advisorMustNameACustomer() {
        assertRejected(() -> service.resolve(advisor, null), HttpStatus.BAD_REQUEST);
    }

    @Test
    void investorGetsTheirOwnConversationWithTheirDistributor() {
        ChatService.Conversation conv = service.resolve(investor, null);

        assertThat(conv.advisorCode()).isEqualTo("ADV-1001");
        assertThat(conv.customerId()).isEqualTo("CL-1");
        assertThat(conv.self()).isEqualTo(ChatSenderRole.INVESTOR);
    }

    @Test
    void investorCannotOpenAnotherCustomersConversation() {
        assertRejected(() -> service.resolve(investor, "CL-2"), HttpStatus.FORBIDDEN);
    }

    @Test
    void investorWithoutADistributorCannotChat() {
        assertRejected(() -> service.resolve(new AuthPrincipal("investor", "CL-2", "Bob"), null), HttpStatus.FORBIDDEN);
    }

    @Test
    void otherRolesCannotChat() {
        assertRejected(() -> service.resolve(admin, "CL-1"), HttpStatus.FORBIDDEN);
        assertRejected(() -> service.conversations(admin), HttpStatus.FORBIDDEN);
    }

    // ---- sending -------------------------------------------------------------------------

    @Test
    void senderRoleAndAdvisorAreTakenFromTheCallerNotTheRequest() {
        service.send(investor, null, "  hello  ", null, null);

        ArgumentCaptor<ChatMessage> saved = ArgumentCaptor.forClass(ChatMessage.class);
        verify(messages).save(saved.capture());
        assertThat(saved.getValue().getSenderRole()).isEqualTo(ChatSenderRole.INVESTOR);
        assertThat(saved.getValue().getAdvisorCode()).isEqualTo("ADV-1001");
        assertThat(saved.getValue().getCustomerId()).isEqualTo("CL-1");
        assertThat(saved.getValue().getBody()).isEqualTo("hello");
    }

    @Test
    void messageIsDeliveredLiveToBothParties() {
        service.send(advisor, "CL-1", "hi", "c-1", null);

        verify(registry).pushMessage(
                org.mockito.ArgumentMatchers.eq("ADVISOR:ADV-1001"),
                org.mockito.ArgumentMatchers.eq("INVESTOR:CL-1"),
                any(),
                org.mockito.ArgumentMatchers.isNull(),
                org.mockito.ArgumentMatchers.contains("\"clientId\":\"c-1\""));
    }

    @Test
    void rejectedSendStoresNothing() {
        assertRejected(() -> service.send(otherAdvisor, "CL-1", "hi", null, null), HttpStatus.FORBIDDEN);

        verify(messages, never()).save(any());
    }

    @Test
    void blankOversizedAndControlCharacterMessagesAreRejected() {
        assertRejected(() -> service.send(advisor, "CL-1", "   ", null, null), HttpStatus.BAD_REQUEST);
        assertRejected(() -> service.send(advisor, "CL-1", null, null, null), HttpStatus.BAD_REQUEST);
        assertRejected(() -> service.send(advisor, "CL-1", "x".repeat(2001), null, null), HttpStatus.BAD_REQUEST);
        assertRejected(() -> service.send(advisor, "CL-1", "bad\u0000byte", null, null), HttpStatus.BAD_REQUEST);
    }

    @Test
    void lineEndingsAreNormalisedAndLongestAllowedMessageIsAccepted() {
        assertThat(ChatService.normalize("a\r\nb\rc")).isEqualTo("a\nb\nc");
        assertThat(ChatService.normalize("x".repeat(2000))).hasSize(2000);
    }

    @Test
    void thirtyFirstMessageInAMinuteIsRateLimited() {
        for (int i = 0; i < 30; i++) {
            service.send(advisor, "CL-1", "m" + i, null, null);
        }

        assertRejected(() -> service.send(advisor, "CL-1", "one too many", null, null), HttpStatus.TOO_MANY_REQUESTS);
    }

    // ---- linking -------------------------------------------------------------------------

    @Test
    void onlyCustomersCanLinkADistributor() {
        assertRejected(() -> service.link(advisor, "ADV-1001"), HttpStatus.FORBIDDEN);
    }

    @Test
    void linkingAnUnknownCodeIsNotFound() {
        when(advisors.findByAccountCodeIgnoreCase("ADV-9999")).thenReturn(Optional.empty());

        assertRejected(() -> service.link(new AuthPrincipal("investor", "CL-2", "Bob"), "ADV-9999"), HttpStatus.NOT_FOUND);
    }

    @Test
    void linkingAKnownCodeConnectsTheCustomer() {
        when(advisors.findByAccountCodeIgnoreCase("adv-1001"))
                .thenReturn(Optional.of(new AdvisorAccount("ADV-1001", "Amit", "a@x.com", "hash", null)));
        InvestorAccount bob = investors.findByCustomerId("CL-2").orElseThrow();

        var result = service.link(new AuthPrincipal("investor", "CL-2", "Bob"), "adv-1001");

        assertThat(result.distributorCode()).isEqualTo("ADV-1001");
        assertThat(bob.getDistributorCode()).isEqualTo("ADV-1001");
        verify(investors).save(bob);
    }

    @Test
    void codeGuessingIsThrottled() {
        when(advisors.findByAccountCodeIgnoreCase(any())).thenReturn(Optional.empty());
        AuthPrincipal bob = new AuthPrincipal("investor", "CL-2", "Bob");
        for (int i = 0; i < 10; i++) {
            assertRejected(() -> service.link(bob, "ADV-0000"), HttpStatus.NOT_FOUND);
        }

        assertRejected(() -> service.link(bob, "ADV-0000"), HttpStatus.TOO_MANY_REQUESTS);
    }

    // ---- listing -------------------------------------------------------------------------

    @Test
    void advisorSeesOnlyTheirOwnCustomers() {
        InvestorAccount ann = investors.findByCustomerId("CL-1").orElseThrow();
        when(investors.findByDistributorCode("ADV-1001")).thenReturn(List.of(ann));
        when(messages.findFirstByAdvisorCodeAndCustomerIdOrderByIdDesc(any(), any())).thenReturn(Optional.empty());

        List<ConversationDto> list = service.conversations(advisor);

        assertThat(list).extracting(ConversationDto::customerId).containsExactly("CL-1");
    }

    @Test
    void investorWithoutADistributorHasNoConversations() {
        assertThat(service.conversations(new AuthPrincipal("investor", "CL-2", "Bob"))).isEmpty();
    }
}
