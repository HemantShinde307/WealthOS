package com.wealthos.auth.chat;

public enum ChatSenderRole {
    ADVISOR,
    INVESTOR;

    public ChatSenderRole other() {
        return this == ADVISOR ? INVESTOR : ADVISOR;
    }
}
