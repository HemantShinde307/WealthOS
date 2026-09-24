package com.wealthos.auth.chat;

import java.time.Instant;

public record ConversationDto(
        String customerId,
        String customerName,
        String advisorCode,
        String advisorName,
        String lastMessage,
        Instant lastMessageAt,
        ChatSenderRole lastSender,
        long unread,
        boolean online) {
}
