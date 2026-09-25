package com.wealthos.auth.chat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** The bytes of one shared file. Deleted (not just hidden) when the file is removed. */
@Entity
@Table(name = "advisor_chat_attachment_blobs")
public class ChatAttachmentBlob {

    @Id
    @Column(name = "attachment_id", length = 36)
    private String attachmentId;

    // Explicit LONGBLOB: without it Hibernate created a TINYBLOB (255 bytes) on MySQL, so any real file failed.
    @Column(nullable = false, columnDefinition = "LONGBLOB")
    private byte[] data;

    protected ChatAttachmentBlob() {
    }

    public ChatAttachmentBlob(String attachmentId, byte[] data) {
        this.attachmentId = attachmentId;
        this.data = data;
    }

    public String getAttachmentId() { return attachmentId; }
    public byte[] getData() { return data; }
}
