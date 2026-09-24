package com.wealthos.auth.chat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class ChatRequests {

    private ChatRequests() {
    }

    public record SendMessageRequest(@Size(max = 32) String customerId, @NotBlank @Size(max = 2000) String text) {
    }

    public record ReadRequest(@Size(max = 32) String customerId) {
    }

    public record LinkRequest(@NotBlank @Size(max = 32) String distributorCode) {
    }

    public record LinkResponse(String distributorCode, String distributorName) {
    }
}
