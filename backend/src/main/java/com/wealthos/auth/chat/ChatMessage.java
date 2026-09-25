package com.wealthos.auth.chat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.Instant;

/** One message in the private conversation between an advisor (distributor) and one of their customers. */
@Entity
// Deliberately not "chat_messages": the shared wealthos_auth database already has an older table of that
// name (different columns) owned by another module, and Hibernate's auto-update must never touch it.
@Table(name = "advisor_chat_messages", indexes = @Index(name = "idx_advisor_chat_conversation", columnList = "advisor_code,customer_id,id"))
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "advisor_code", nullable = false, length = 32)
    private String advisorCode;

    @Column(name = "customer_id", nullable = false, length = 32)
    private String customerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "sender_role", nullable = false, length = 16)
    private ChatSenderRole senderRole;

    @Column(nullable = false, length = 2000)
    private String body;

    @Column(name = "sent_at", nullable = false, updatable = false)
    private Instant sentAt = Instant.now();

    @Column(name = "read_at")
    private Instant readAt;

    @Column(name = "attachment_id", length = 36)
    private String attachmentId;

    protected ChatMessage() {
    }

    public ChatMessage(String advisorCode, String customerId, ChatSenderRole senderRole, String body) {
        this.advisorCode = advisorCode;
        this.customerId = customerId;
        this.senderRole = senderRole;
        this.body = body;
    }

    public ChatMessage(String advisorCode, String customerId, ChatSenderRole senderRole, String body, String attachmentId) {
        this(advisorCode, customerId, senderRole, body);
        this.attachmentId = attachmentId;
    }

    public Long getId() { return id; }
    public String getAdvisorCode() { return advisorCode; }
    public String getCustomerId() { return customerId; }
    public ChatSenderRole getSenderRole() { return senderRole; }
    public String getBody() { return body; }
    public Instant getSentAt() { return sentAt; }
    public Instant getReadAt() { return readAt; }
    public String getAttachmentId() { return attachmentId; }
}
