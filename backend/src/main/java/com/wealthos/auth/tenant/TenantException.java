package com.wealthos.auth.tenant;

import org.springframework.http.HttpStatus;

/** A tenant/plan rule was broken; carries an HTTP status and a message that is safe to show. */
public class TenantException extends RuntimeException {

    private final HttpStatus status;

    public TenantException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
