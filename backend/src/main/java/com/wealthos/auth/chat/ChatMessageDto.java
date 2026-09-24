package com.wealthos.auth.chat;

import java.time.Instant;

public record ChatMessageDto(
        Long id, String customerId, String advisorCode, ChatSenderRole senderRole, String text, Instant sentAt, Instant readAt) {

    public static ChatMessageDto from(ChatMessage m) {
        return new ChatMessageDto(m.getId(), m.getCustomerId(), m.getAdvisorCode(), m.getSenderRole(), m.getBody(), m.getSentAt(), m.getReadAt());
    }
}
