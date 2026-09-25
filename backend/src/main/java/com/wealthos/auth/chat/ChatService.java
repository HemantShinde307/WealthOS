package com.wealthos.auth.chat;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.wealthos.auth.chat.AttachmentDtos.AttachmentDto;
import com.wealthos.auth.chat.ChatRequests.LinkResponse;
import com.wealthos.auth.model.AdvisorAccount;
import com.wealthos.auth.model.InvestorAccount;
import com.wealthos.auth.repository.AdvisorAccountRepository;
import com.wealthos.auth.repository.InvestorAccountRepository;
import com.wealthos.auth.security.AuthPrincipal;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.socket.WebSocketSession;
import tools.jackson.databind.ObjectMapper;

/**
 * All chat rules live here so the REST controller and the WebSocket handler cannot disagree:
 * who may talk to whom, message validation, rate limiting, persistence and live delivery.
 * The caller's identity always comes from the verified token ({@link AuthPrincipal}).
 */
@Service
public class ChatService {

    public static final int MAX_TEXT_LENGTH = 2000;
    private static final int DEFAULT_PAGE = 50;
    private static final int MAX_PAGE = 100;

    private final ChatMessageRepository messages;
    private final ChatAttachmentRepository attachments;
    private final InvestorAccountRepository investors;
    private final AdvisorAccountRepository advisors;
    private final ChatSessionRegistry registry;
    private final ObjectMapper json;

    private final RateLimiter sendLimiter = new RateLimiter(30, Duration.ofMinutes(1));
    private final RateLimiter linkLimiter = new RateLimiter(10, Duration.ofMinutes(1));

    public ChatService(
            ChatMessageRepository messages,
            ChatAttachmentRepository attachments,
            InvestorAccountRepository investors,
            AdvisorAccountRepository advisors,
            ChatSessionRegistry registry,
            ObjectMapper json) {
        this.messages = messages;
        this.attachments = attachments;
        this.investors = investors;
        this.advisors = advisors;
        this.registry = registry;
        this.json = json;
    }

    /** A verified conversation the caller is allowed to use, and which side of it they are. */
    public record Conversation(String advisorCode, String customerId, ChatSenderRole self) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    record MessageEvent(String type, ChatMessageDto message, String clientId) {
    }

    record ReadEvent(String type, String customerId, ChatSenderRole by, long upToId) {
    }

    record PresenceEvent(String type, ChatSenderRole role, String code, boolean online) {
    }

    record AttachmentRemovedEvent(String type, String customerId, String attachmentId) {
    }

    public record ErrorEvent(String type, String error) {
        public ErrorEvent(String error) {
            this("error", error);
        }
    }

    // ---- authorization -------------------------------------------------------------------

    public Conversation resolve(AuthPrincipal principal, String requestedCustomerId) {
        if (principal.isAdvisor()) {
            if (requestedCustomerId == null || requestedCustomerId.isBlank()) {
                throw new ChatException(HttpStatus.BAD_REQUEST, "Choose a customer to chat with.");
            }
            InvestorAccount investor = investors.findByCustomerId(requestedCustomerId.trim()).orElse(null);
            // Same answer for "no such customer" and "not your customer": don't reveal which IDs exist.
            if (investor == null
                    || !principal.code().equalsIgnoreCase(nullToEmpty(investor.getDistributorCode()))
                    || !Objects.equals(principal.tenantId(), investor.getTenantId())) {
                throw new ChatException(HttpStatus.FORBIDDEN, "This customer is not connected to you.");
            }
            return new Conversation(principal.code(), investor.getCustomerId(), ChatSenderRole.ADVISOR);
        }
        if (principal.isInvestor()) {
            if (requestedCustomerId != null && !requestedCustomerId.isBlank() && !requestedCustomerId.trim().equals(principal.code())) {
                throw new ChatException(HttpStatus.FORBIDDEN, "You can only view your own conversation.");
            }
            InvestorAccount investor = investors.findByCustomerId(principal.code())
                    .orElseThrow(() -> new ChatException(HttpStatus.FORBIDDEN, "Account not found."));
            String distributorCode = investor.getDistributorCode();
            if (distributorCode == null || distributorCode.isBlank()) {
                throw new ChatException(HttpStatus.FORBIDDEN, "Connect with your distributor first.");
            }
            AdvisorAccount advisor = advisors.findByAccountCode(distributorCode)
                    .orElseThrow(() -> new ChatException(HttpStatus.FORBIDDEN, "Your distributor could not be found."));
            // A customer, their distributor and the token must all belong to the same firm.
            if (!Objects.equals(principal.tenantId(), investor.getTenantId()) || !Objects.equals(advisor.getTenantId(), investor.getTenantId())) {
                throw new ChatException(HttpStatus.FORBIDDEN, "Your distributor could not be found.");
            }
            return new Conversation(advisor.getAccountCode(), investor.getCustomerId(), ChatSenderRole.INVESTOR);
        }
        throw new ChatException(HttpStatus.FORBIDDEN, "Chat is available to distributors and their customers only.");
    }

    // ---- messages -----------------------------------------------------------------------

    public ChatMessageDto send(AuthPrincipal principal, String requestedCustomerId, String rawText, String clientId, WebSocketSession origin) {
        Conversation conv = resolve(principal, requestedCustomerId);
        String text = normalize(rawText);
        if (!sendLimiter.tryAcquire(ChatSessionRegistry.key(conv.self(), principal.code()))) {
            throw new ChatException(HttpStatus.TOO_MANY_REQUESTS, "You are sending messages too quickly. Please wait a moment.");
        }

        ChatMessage saved = messages.save(new ChatMessage(conv.advisorCode(), conv.customerId(), conv.self(), text));
        ChatMessageDto dto = ChatMessageDto.from(saved);

        publish(conv, dto, clientId, origin);
        return dto;
    }

    /** Pushes a stored message to every live socket of both participants. */
    public void publish(Conversation conv, ChatMessageDto dto, String clientId, WebSocketSession origin) {
        String plain = write(new MessageEvent("message", dto, null));
        String forOrigin = clientId == null ? plain : write(new MessageEvent("message", dto, clientId));
        registry.pushMessage(
                ChatSessionRegistry.key(ChatSenderRole.ADVISOR, conv.advisorCode()),
                ChatSessionRegistry.key(ChatSenderRole.INVESTOR, conv.customerId()),
                plain,
                origin,
                forOrigin);
    }

    public void publishAttachmentRemoved(Conversation conv, String attachmentId) {
        String event = write(new AttachmentRemovedEvent("attachment-removed", conv.customerId(), attachmentId));
        registry.push(ChatSessionRegistry.key(ChatSenderRole.ADVISOR, conv.advisorCode()), event);
        registry.push(ChatSessionRegistry.key(ChatSenderRole.INVESTOR, conv.customerId()), event);
    }

    private List<ChatMessageDto> toDtos(List<ChatMessage> list) {
        Set<String> ids = list.stream().map(ChatMessage::getAttachmentId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<String, ChatAttachment> byId = ids.isEmpty()
                ? Map.of()
                : attachments.findAllById(ids).stream().collect(Collectors.toMap(ChatAttachment::getId, a -> a));
        return list.stream()
                .map(m -> ChatMessageDto.from(
                        m,
                        m.getAttachmentId() == null ? null : Optional.ofNullable(byId.get(m.getAttachmentId())).map(AttachmentDto::from).orElse(null)))
                .toList();
    }

    private String previewOf(Optional<ChatMessage> last) {
        return last.map(m -> {
            if (!m.getBody().isBlank() || m.getAttachmentId() == null) {
                return m.getBody();
            }
            return attachments.findById(m.getAttachmentId()).map(a -> "Attachment: " + a.getOriginalName()).orElse("Attachment");
        }).orElse(null);
    }

    public List<ChatMessageDto> history(AuthPrincipal principal, String requestedCustomerId, Long beforeId, Integer limit) {
        Conversation conv = resolve(principal, requestedCustomerId);
        int size = limit == null ? DEFAULT_PAGE : Math.max(1, Math.min(limit, MAX_PAGE));
        PageRequest page = PageRequest.of(0, size);
        List<ChatMessage> found = beforeId == null
                ? messages.findByAdvisorCodeAndCustomerIdOrderByIdDesc(conv.advisorCode(), conv.customerId(), page)
                : messages.findByAdvisorCodeAndCustomerIdAndIdLessThanOrderByIdDesc(conv.advisorCode(), conv.customerId(), beforeId, page);
        List<ChatMessageDto> result = new ArrayList<>(toDtos(found));
        Collections.reverse(result);
        return result;
    }

    @Transactional
    public void markRead(AuthPrincipal principal, String requestedCustomerId) {
        Conversation conv = resolve(principal, requestedCustomerId);
        ChatSenderRole other = conv.self().other();
        int updated = messages.markRead(conv.advisorCode(), conv.customerId(), other, Instant.now());
        if (updated > 0) {
            Long upTo = messages.findMaxIdBySender(conv.advisorCode(), conv.customerId(), other);
            String event = write(new ReadEvent("read", conv.customerId(), conv.self(), upTo == null ? 0 : upTo));
            registry.push(ChatSessionRegistry.key(ChatSenderRole.ADVISOR, conv.advisorCode()), event);
            registry.push(ChatSessionRegistry.key(ChatSenderRole.INVESTOR, conv.customerId()), event);
        }
    }

    // ---- conversations, linking, presence ------------------------------------------------

    public List<ConversationDto> conversations(AuthPrincipal principal) {
        if (principal.isAdvisor()) {
            String advisorName = advisors.findByAccountCode(principal.code()).map(AdvisorAccount::getName).orElse(principal.name());
            List<ConversationDto> result = new ArrayList<>();
            for (InvestorAccount customer : investors.findByDistributorCode(principal.code())) {
                result.add(summarise(principal.code(), advisorName, customer, ChatSenderRole.ADVISOR));
            }
            result.sort(Comparator
                    .comparing(ConversationDto::lastMessageAt, Comparator.nullsLast(Comparator.reverseOrder()))
                    .thenComparing(ConversationDto::customerName, String.CASE_INSENSITIVE_ORDER));
            return result;
        }
        if (principal.isInvestor()) {
            Optional<InvestorAccount> customer = investors.findByCustomerId(principal.code());
            if (customer.isEmpty() || customer.get().getDistributorCode() == null || customer.get().getDistributorCode().isBlank()) {
                return List.of();
            }
            return advisors.findByAccountCode(customer.get().getDistributorCode())
                    .map(advisor -> List.of(summarise(advisor.getAccountCode(), advisor.getName(), customer.get(), ChatSenderRole.INVESTOR)))
                    .orElse(List.of());
        }
        throw new ChatException(HttpStatus.FORBIDDEN, "Chat is available to distributors and their customers only.");
    }

    private ConversationDto summarise(String advisorCode, String advisorName, InvestorAccount customer, ChatSenderRole viewer) {
        Optional<ChatMessage> last = messages.findFirstByAdvisorCodeAndCustomerIdOrderByIdDesc(advisorCode, customer.getCustomerId());
        long unread = messages.countByAdvisorCodeAndCustomerIdAndSenderRoleAndReadAtIsNull(advisorCode, customer.getCustomerId(), viewer.other());
        boolean online = viewer == ChatSenderRole.ADVISOR
                ? registry.isOnline(ChatSenderRole.INVESTOR, customer.getCustomerId())
                : registry.isOnline(ChatSenderRole.ADVISOR, advisorCode);
        return new ConversationDto(
                customer.getCustomerId(),
                customer.getName(),
                advisorCode,
                advisorName,
                previewOf(last),
                last.map(ChatMessage::getSentAt).orElse(null),
                last.map(ChatMessage::getSenderRole).orElse(null),
                unread,
                online);
    }

    public LinkResponse link(AuthPrincipal principal, String distributorCode) {
        if (!principal.isInvestor()) {
            throw new ChatException(HttpStatus.FORBIDDEN, "Only customers can connect to a distributor.");
        }
        // Distributor codes are guessable (ADV-1001...), so throttle attempts to stop enumeration.
        if (!linkLimiter.tryAcquire("link:" + principal.code())) {
            throw new ChatException(HttpStatus.TOO_MANY_REQUESTS, "Too many attempts. Please wait a minute and try again.");
        }
        InvestorAccount investor = investors.findByCustomerId(principal.code())
                .orElseThrow(() -> new ChatException(HttpStatus.FORBIDDEN, "Account not found."));
        // A distributor of another firm answers exactly like an unknown code.
        AdvisorAccount advisor = advisors.findByAccountCodeIgnoreCase(distributorCode.trim())
                .filter(a -> Objects.equals(a.getTenantId(), investor.getTenantId()) && Objects.equals(principal.tenantId(), investor.getTenantId()))
                .orElseThrow(() -> new ChatException(HttpStatus.NOT_FOUND, "No distributor found with that code."));
        investor.setDistributorCode(advisor.getAccountCode());
        investors.save(investor);
        if (registry.isOnline(ChatSenderRole.INVESTOR, investor.getCustomerId())) {
            registry.push(
                    ChatSessionRegistry.key(ChatSenderRole.ADVISOR, advisor.getAccountCode()),
                    write(new PresenceEvent("presence", ChatSenderRole.INVESTOR, investor.getCustomerId(), true)));
        }
        return new LinkResponse(advisor.getAccountCode(), advisor.getName());
    }

    /** The user keys that care whether this principal is online (their connected counterparties). */
    public List<String> presenceAudience(AuthPrincipal principal) {
        if (principal.isAdvisor()) {
            return investors.findByDistributorCode(principal.code()).stream()
                    .map(c -> ChatSessionRegistry.key(ChatSenderRole.INVESTOR, c.getCustomerId()))
                    .toList();
        }
        if (principal.isInvestor()) {
            return investors.findByCustomerId(principal.code())
                    .map(InvestorAccount::getDistributorCode)
                    .filter(code -> code != null && !code.isBlank())
                    .map(code -> List.of(ChatSessionRegistry.key(ChatSenderRole.ADVISOR, code)))
                    .orElse(List.of());
        }
        return List.of();
    }

    public void announcePresence(AuthPrincipal principal, boolean online) {
        ChatSenderRole role = principal.isAdvisor() ? ChatSenderRole.ADVISOR : ChatSenderRole.INVESTOR;
        String event = write(new PresenceEvent("presence", role, principal.code(), online));
        for (String audienceKey : presenceAudience(principal)) {
            registry.push(audienceKey, event);
        }
    }

    /** Presence of already-online counterparties, sent to a socket that has just authenticated. */
    public List<String> initialPresenceEvents(AuthPrincipal principal) {
        List<String> events = new ArrayList<>();
        if (principal.isAdvisor()) {
            for (InvestorAccount c : investors.findByDistributorCode(principal.code())) {
                if (registry.isOnline(ChatSenderRole.INVESTOR, c.getCustomerId())) {
                    events.add(write(new PresenceEvent("presence", ChatSenderRole.INVESTOR, c.getCustomerId(), true)));
                }
            }
        } else if (principal.isInvestor()) {
            investors.findByCustomerId(principal.code()).map(InvestorAccount::getDistributorCode).ifPresent(code -> {
                if (code != null && registry.isOnline(ChatSenderRole.ADVISOR, code)) {
                    events.add(write(new PresenceEvent("presence", ChatSenderRole.ADVISOR, code, true)));
                }
            });
        }
        return events;
    }

    public String errorFrame(String message) {
        return write(new ErrorEvent(message));
    }

    // ---- helpers -------------------------------------------------------------------------

    /** Trims, normalises line endings and rejects empty, oversized or control-character input. */
    static String normalize(String raw) {
        if (raw == null) {
            throw new ChatException(HttpStatus.BAD_REQUEST, "Type a message first.");
        }
        String text = raw.replace("\r\n", "\n").replace('\r', '\n').trim();
        if (text.isEmpty()) {
            throw new ChatException(HttpStatus.BAD_REQUEST, "Type a message first.");
        }
        if (text.length() > MAX_TEXT_LENGTH) {
            throw new ChatException(HttpStatus.BAD_REQUEST, "Messages are limited to " + MAX_TEXT_LENGTH + " characters.");
        }
        for (int i = 0; i < text.length(); i++) {
            char c = text.charAt(i);
            if (c < 0x20 && c != '\n' && c != '\t') {
                throw new ChatException(HttpStatus.BAD_REQUEST, "That message contains characters that are not allowed.");
            }
        }
        return text;
    }

    private String write(Object event) {
        return json.writeValueAsString(event);
    }

    private static String nullToEmpty(String s) {
        return s == null ? "" : s;
    }
}
