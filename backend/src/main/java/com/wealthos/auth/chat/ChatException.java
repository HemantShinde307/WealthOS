package com.wealthos.auth.chat;

import org.springframework.http.HttpStatus;

/** A chat rule was broken; carries the HTTP status and a message that is safe to show the user. */
public class ChatException extends RuntimeException {

    private final HttpStatus status;

    public ChatException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
