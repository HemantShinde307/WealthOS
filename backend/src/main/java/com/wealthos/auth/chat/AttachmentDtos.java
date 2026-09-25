package com.wealthos.auth.chat;

import java.time.Instant;

public final class AttachmentDtos {

    private AttachmentDtos() {
    }

    /** Embedded in a message. {@code removed} attachments keep their name/size but have no content. */
    public record AttachmentDto(String id, String name, String contentType, long size, boolean previewable, boolean removed) {

        static AttachmentDto from(ChatAttachment a) {
            return new AttachmentDto(a.getId(), a.getOriginalName(), a.getContentType(), a.getSizeBytes(), isPreviewable(a.getContentType()), a.isRemoved());
        }
    }

    public record FileItemDto(
            String id, Long messageId, String name, String contentType, long size, boolean previewable, ChatSenderRole uploadedBy, Instant uploadedAt) {

        static FileItemDto from(ChatAttachment a) {
            return new FileItemDto(
                    a.getId(), a.getMessageId(), a.getOriginalName(), a.getContentType(), a.getSizeBytes(),
                    isPreviewable(a.getContentType()), a.getUploaderRole(), a.getUploadedAt());
        }
    }

    /** Only images and PDFs are ever rendered by the browser; everything else is download-only. */
    static boolean isPreviewable(String contentType) {
        return contentType != null && (contentType.startsWith("image/") || contentType.equals("application/pdf"));
    }
}
