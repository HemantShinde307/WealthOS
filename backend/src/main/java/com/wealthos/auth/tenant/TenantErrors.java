package com.wealthos.auth.tenant;

import com.wealthos.auth.dto.ErrorResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/** Global on purpose: tenant rules are also raised from the login and signup controllers. */
@RestControllerAdvice
public class TenantErrors {

    @ExceptionHandler(TenantException.class)
    public ResponseEntity<ErrorResponse> handle(TenantException ex) {
        return ResponseEntity.status(ex.getStatus()).body(new ErrorResponse(ex.getMessage()));
    }
}
