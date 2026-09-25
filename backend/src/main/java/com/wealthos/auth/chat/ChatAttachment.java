package com.wealthos.auth.chat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.Instant;

/**
 * Metadata for a file shared in a conversation. The file itself lives in {@link ChatAttachmentBlob}
 * so listing files never loads file contents. The id is random and is the only name the file is
 * stored under; the user's file name is display-only (and sanitised).
 */
@Entity
@Table(name = "advisor_chat_attachments", indexes = @Index(name = "idx_chat_attachment_conv", columnList = "advisor_code,customer_id,uploaded_at"))
public class ChatAttachment {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "advisor_code", nullable = false, length = 32)
    private String advisorCode;

    @Column(name = "customer_id", nullable = false, length = 32)
    private String customerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "uploader_role", nullable = false, length = 16)
    private ChatSenderRole uploaderRole;

    @Column(name = "message_id")
    private Long messageId;

    @Column(name = "original_name", nullable = false, length = 160)
    private String originalName;

    @Column(name = "content_type", nullable = false, length = 120)
    private String contentType;

    @Column(name = "size_bytes", nullable = false)
    private long sizeBytes;

    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private Instant uploadedAt = Instant.now();

    @Column(name = "removed_at")
    private Instant removedAt;

    protected ChatAttachment() {
    }

    public ChatAttachment(String id, String advisorCode, String customerId, ChatSenderRole uploaderRole, String originalName, String contentType, long sizeBytes) {
        this.id = id;
        this.advisorCode = advisorCode;
        this.customerId = customerId;
        this.uploaderRole = uploaderRole;
        this.originalName = originalName;
        this.contentType = contentType;
        this.sizeBytes = sizeBytes;
    }

    public String getId() { return id; }
    public String getAdvisorCode() { return advisorCode; }
    public String getCustomerId() { return customerId; }
    public ChatSenderRole getUploaderRole() { return uploaderRole; }
    public Long getMessageId() { return messageId; }
    public void setMessageId(Long messageId) { this.messageId = messageId; }
    public String getOriginalName() { return originalName; }
    public String getContentType() { return contentType; }
    public long getSizeBytes() { return sizeBytes; }
    public Instant getUploadedAt() { return uploadedAt; }
    public Instant getRemovedAt() { return removedAt; }
    public boolean isRemoved() { return removedAt != null; }
    public void markRemoved() { this.removedAt = Instant.now(); }
}
