package com.wealthos.auth.chat;

import com.wealthos.auth.chat.ChatRequests.LinkRequest;
import com.wealthos.auth.chat.ChatRequests.LinkResponse;
import com.wealthos.auth.chat.ChatRequests.ReadRequest;
import com.wealthos.auth.chat.ChatRequests.SendMessageRequest;
import com.wealthos.auth.dto.ErrorResponse;
import com.wealthos.auth.security.AuthPrincipal;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** REST side of the chat. Every route sits behind {@code BearerAuthInterceptor}; the caller comes from the token. */
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chat;

    public ChatController(ChatService chat) {
        this.chat = chat;
    }

    @GetMapping("/conversations")
    public List<ConversationDto> conversations(@RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal) {
        return chat.conversations(principal);
    }

    @GetMapping("/messages")
    public List<ChatMessageDto> messages(
            @RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal,
            @RequestParam(required = false) String customerId,
            @RequestParam(required = false) Long beforeId,
            @RequestParam(required = false) Integer limit) {
        return chat.history(principal, customerId, beforeId, limit);
    }

    @PostMapping("/messages")
    public ResponseEntity<ChatMessageDto> send(
            @RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal, @Valid @RequestBody SendMessageRequest request) {
        ChatMessageDto saved = chat.send(principal, request.customerId(), request.text(), null, null);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/read")
    public ResponseEntity<Void> read(
            @RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal, @Valid @RequestBody ReadRequest request) {
        chat.markRead(principal, request.customerId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/link")
    public LinkResponse link(
            @RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal, @Valid @RequestBody LinkRequest request) {
        return chat.link(principal, request.distributorCode());
    }

    @ExceptionHandler(ChatException.class)
    public ResponseEntity<ErrorResponse> handleChat(ChatException ex) {
        return ResponseEntity.status(ex.getStatus()).body(new ErrorResponse(ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleInvalid(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream().findFirst()
                .map(e -> "Invalid " + e.getField() + ".")
                .orElse("Invalid request.");
        return ResponseEntity.badRequest().body(new ErrorResponse(message));
    }
}
