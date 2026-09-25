package com.wealthos.auth.chat;

import com.wealthos.auth.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;

/**
 * Upload problems are raised while the request is still being parsed, before any controller method
 * runs, so a controller-local handler would never see them.
 */
@RestControllerAdvice
public class ChatUploadErrors {

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> tooLarge(MaxUploadSizeExceededException ex) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(new ErrorResponse("That file is larger than 10 MB."));
    }

    @ExceptionHandler(MissingServletRequestPartException.class)
    public ResponseEntity<ErrorResponse> missing(MissingServletRequestPartException ex) {
        return ResponseEntity.badRequest().body(new ErrorResponse("Choose a file to upload."));
    }

    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<ErrorResponse> unreadable(MultipartException ex) {
        return ResponseEntity.badRequest().body(new ErrorResponse("The upload could not be read. Please try again."));
    }
}
