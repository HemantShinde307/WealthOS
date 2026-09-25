package com.wealthos.auth.chat;

import com.wealthos.auth.chat.AttachmentDtos.AttachmentDto;
import com.wealthos.auth.chat.AttachmentDtos.FileItemDto;
import com.wealthos.auth.chat.ChatService.Conversation;
import com.wealthos.auth.chat.FileTypePolicy.Accepted;
import com.wealthos.auth.security.AuthPrincipal;
import com.wealthos.auth.tenant.TenantLimits;
import java.time.Duration;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * Sharing files inside a conversation. Every operation re-checks, from the caller's verified token,
 * that they are one of the two people in the conversation the file belongs to; for anyone else a
 * file simply does not exist (404), so ids cannot be probed.
 */
@Service
public class ChatAttachmentService {

    private static final Logger log = LoggerFactory.getLogger(ChatAttachmentService.class);
    static final long MAX_CONVERSATION_BYTES = 250L * 1024 * 1024;
    private static final int MAX_LIST = 200;
    private static final Pattern ID_SHAPE = Pattern.compile("^[0-9a-fA-F-]{36}$");

    public record Content(String name, String contentType, long size, boolean previewable, byte[] data) {
    }

    private record Access(ChatAttachment attachment, Conversation conversation) {
    }

    private final ChatService chat;
    private final ChatAttachmentRepository attachments;
    private final ChatAttachmentBlobRepository blobs;
    private final ChatMessageRepository messages;
    private final TransactionTemplate tx;
    private final TenantLimits limits;
    private final RateLimiter uploadLimiter = new RateLimiter(10, Duration.ofMinutes(1));

    public ChatAttachmentService(
            ChatService chat,
            ChatAttachmentRepository attachments,
            ChatAttachmentBlobRepository blobs,
            ChatMessageRepository messages,
            TransactionTemplate tx,
            TenantLimits limits) {
        this.chat = chat;
        this.attachments = attachments;
        this.blobs = blobs;
        this.messages = messages;
        this.tx = tx;
        this.limits = limits;
    }

    public ChatMessageDto upload(AuthPrincipal principal, String requestedCustomerId, String originalName, byte[] data, String rawCaption) {
        Conversation conv = chat.resolve(principal, requestedCustomerId);
        if (!uploadLimiter.tryAcquire("upload:" + conv.self() + ":" + principal.code())) {
            throw new ChatException(HttpStatus.TOO_MANY_REQUESTS, "You are uploading too quickly. Please wait a moment.");
        }
        if (data == null || data.length == 0) {
            throw new ChatException(HttpStatus.BAD_REQUEST, "That file is empty.");
        }
        if (data.length > FileTypePolicy.MAX_BYTES) {
            throw new ChatException(HttpStatus.PAYLOAD_TOO_LARGE, "That file is larger than 10 MB.");
        }
        Accepted type = FileTypePolicy.check(originalName, data);
        String caption = rawCaption == null || rawCaption.isBlank() ? "" : ChatService.normalize(rawCaption);
        if (attachments.totalStoredBytes(conv.advisorCode(), conv.customerId()) + data.length > MAX_CONVERSATION_BYTES) {
            throw new ChatException(HttpStatus.PAYLOAD_TOO_LARGE, "This conversation has reached its file storage limit. Remove some files first.");
        }

        if (principal.tenantId() != null) {
            var allowance = limits.storageLimitBytes(principal.tenantId());
            if (allowance.isPresent() && limits.storageUsedBytes(principal.tenantId()) + data.length > allowance.get()) {
                throw new ChatException(HttpStatus.PAYLOAD_TOO_LARGE, "Your firm's plan storage is full. Ask your administrator to remove files or upgrade.");
            }
        }

        String id = UUID.randomUUID().toString();
        ChatMessageDto dto = tx.execute(status -> {
            ChatAttachment attachment = new ChatAttachment(id, conv.advisorCode(), conv.customerId(), conv.self(), type.safeName(), type.contentType(), data.length);
            attachments.save(attachment);
            blobs.save(new ChatAttachmentBlob(id, data));
            ChatMessage message = messages.save(new ChatMessage(conv.advisorCode(), conv.customerId(), conv.self(), caption, id));
            attachment.setMessageId(message.getId());
            attachments.save(attachment);
            return ChatMessageDto.from(message, AttachmentDto.from(attachment));
        });
        // Delivered only after the file and message are safely stored.
        chat.publish(conv, dto, null, null);
        log.info("chat file uploaded id={} by={}:{} size={} type={}", id, conv.self(), principal.code(), data.length, type.contentType());
        return dto;
    }

    public List<FileItemDto> list(AuthPrincipal principal, String requestedCustomerId) {
        Conversation conv = chat.resolve(principal, requestedCustomerId);
        return attachments
                .findByAdvisorCodeAndCustomerIdAndRemovedAtIsNullOrderByUploadedAtDesc(conv.advisorCode(), conv.customerId(), PageRequest.of(0, MAX_LIST))
                .stream()
                .map(FileItemDto::from)
                .toList();
    }

    public Content content(AuthPrincipal principal, String id) {
        Access access = authorize(principal, id);
        ChatAttachment a = access.attachment();
        if (a.isRemoved()) {
            throw notFound();
        }
        ChatAttachmentBlob blob = blobs.findById(a.getId()).orElseThrow(ChatAttachmentService::notFound);
        log.info("chat file opened id={} by={}:{}", a.getId(), access.conversation().self(), principal.code());
        return new Content(a.getOriginalName(), a.getContentType(), a.getSizeBytes(), AttachmentDtos.isPreviewable(a.getContentType()), blob.getData());
    }

    public void remove(AuthPrincipal principal, String id) {
        Access access = authorize(principal, id);
        ChatAttachment a = access.attachment();
        if (a.isRemoved()) {
            throw notFound();
        }
        // The distributor manages everything shared with them; a customer can only take back what they sent.
        if (access.conversation().self() == ChatSenderRole.INVESTOR && a.getUploaderRole() != ChatSenderRole.INVESTOR) {
            throw new ChatException(HttpStatus.FORBIDDEN, "You can only remove files you shared.");
        }
        tx.executeWithoutResult(status -> {
            a.markRemoved();
            attachments.save(a);
            blobs.deleteById(a.getId());
        });
        chat.publishAttachmentRemoved(access.conversation(), a.getId());
        log.info("chat file removed id={} by={}:{}", a.getId(), access.conversation().self(), principal.code());
    }

    private Access authorize(AuthPrincipal principal, String id) {
        if (id == null || !ID_SHAPE.matcher(id).matches()) {
            throw notFound();
        }
        ChatAttachment a = attachments.findById(id).orElseThrow(ChatAttachmentService::notFound);
        Conversation conv;
        try {
            conv = chat.resolve(principal, a.getCustomerId());
        } catch (ChatException e) {
            throw notFound();
        }
        // If the customer has since linked a different distributor, the old files are not theirs to read.
        if (!conv.advisorCode().equals(a.getAdvisorCode()) || !conv.customerId().equals(a.getCustomerId())) {
            throw notFound();
        }
        return new Access(a, conv);
    }

    private static ChatException notFound() {
        return new ChatException(HttpStatus.NOT_FOUND, "That file is not available.");
    }
}
