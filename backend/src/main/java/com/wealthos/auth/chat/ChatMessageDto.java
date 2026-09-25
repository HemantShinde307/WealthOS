package com.wealthos.auth.chat;

import com.wealthos.auth.chat.AttachmentDtos.AttachmentDto;
import java.time.Instant;

public record ChatMessageDto(
        Long id, String customerId, String advisorCode, ChatSenderRole senderRole, String text, Instant sentAt, Instant readAt, AttachmentDto attachment) {

    public static ChatMessageDto from(ChatMessage m) {
        return from(m, null);
    }

    public static ChatMessageDto from(ChatMessage m, AttachmentDto attachment) {
        return new ChatMessageDto(
                m.getId(), m.getCustomerId(), m.getAdvisorCode(), m.getSenderRole(), m.getBody(), m.getSentAt(), m.getReadAt(), attachment);
    }
}
