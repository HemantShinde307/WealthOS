package com.wealthos.auth.chat;

import com.wealthos.auth.chat.AttachmentDtos.FileItemDto;
import com.wealthos.auth.chat.ChatAttachmentService.Content;
import com.wealthos.auth.dto.ErrorResponse;
import com.wealthos.auth.security.AuthPrincipal;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/** Sits behind {@code BearerAuthInterceptor} (it covers /api/chat/**): the caller always comes from the token. */
@RestController
@RequestMapping("/api/chat/attachments")
public class ChatAttachmentController {

    private final ChatAttachmentService files;

    public ChatAttachmentController(ChatAttachmentService files) {
        this.files = files;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ChatMessageDto> upload(
            @RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal,
            @RequestPart("file") MultipartFile file,
            @RequestParam(required = false) String customerId,
            @RequestParam(required = false) String caption)
            throws IOException {
        ChatMessageDto message = files.upload(principal, customerId, file.getOriginalFilename(), file.getBytes(), caption);
        return ResponseEntity.status(HttpStatus.CREATED).body(message);
    }

    @GetMapping
    public List<FileItemDto> list(
            @RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal, @RequestParam(required = false) String customerId) {
        return files.list(principal, customerId);
    }

    @GetMapping("/{id}/content")
    public ResponseEntity<byte[]> content(
            @RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal,
            @PathVariable String id,
            @RequestParam(defaultValue = "false") boolean download) {
        Content content = files.content(principal, id);
        return ResponseEntity.ok().headers(contentHeaders(content, download)).body(content.data());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remove(@RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal, @PathVariable String id) {
        files.remove(principal, id);
        return ResponseEntity.noContent().build();
    }

    /**
     * The type comes from the server's allow-list, never from the upload. Only images and PDFs may be
     * shown inline; everything else is forced to download. nosniff and a locked-down CSP stop a browser
     * from treating the bytes as anything else.
     */
    static HttpHeaders contentHeaders(Content content, boolean download) {
        boolean inline = content.previewable() && !download;
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(content.contentType()));
        headers.setContentLength(content.data().length);
        headers.setContentDisposition(
                (inline ? ContentDisposition.inline() : ContentDisposition.attachment()).filename(content.name(), StandardCharsets.UTF_8).build());
        headers.setCacheControl(CacheControl.noStore().cachePrivate());
        headers.set("X-Content-Type-Options", "nosniff");
        headers.set("Content-Security-Policy", "default-src 'none'; sandbox");
        return headers;
    }

    @ExceptionHandler(ChatException.class)
    public ResponseEntity<ErrorResponse> handleChat(ChatException ex) {
        return ResponseEntity.status(ex.getStatus()).body(new ErrorResponse(ex.getMessage()));
    }
}
